import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function makeAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  return createClient(url, serviceKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function isSuperAdmin(client: ReturnType<typeof createClient>) {
  const { data: { user } } = await client.auth.getUser();
  if (!user) return false;
  const { data } = await client.from("profiles").select("role, disabled").eq("id", user.id).maybeSingle();
  return data?.role === "super_admin" && data?.disabled === false;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/admin-users/, "");
    const client = makeAdmin(req);

    if (!(await isSuperAdmin(client))) return json({ error: "Not authorized" }, 403);

    // GET /admin-users — list users + profiles
    if (req.method === "GET" && path === "/") {
      const { data: users, error: ue } = await client.auth.admin.listUsers();
      if (ue) return json({ error: "Failed to list users" }, 500);
      const { data: profiles } = await client.from("profiles").select("*");
      const pMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
      const result = (users.users ?? []).map((u: any) => ({
        id: u.id, email: u.email, created_at: u.created_at,
        role: pMap.get(u.id)?.role ?? "content_editor",
        full_name: pMap.get(u.id)?.full_name ?? null,
        disabled: pMap.get(u.id)?.disabled ?? false,
      }));
      return json({ users: result });
    }

    // POST /admin-users — create user
    if (req.method === "POST" && path === "/") {
      const { email, password, full_name, role } = await req.json();
      if (!email || !password) return json({ error: "Email and password are required" }, 400);
      if (password.length < 8) return json({ error: "Password must be at least 8 characters" }, 400);
      if (role && !["super_admin", "content_editor"].includes(role))
        return json({ error: "Invalid role" }, 400);

      const { data: created, error: ce } = await client.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: full_name ?? "" },
      });
      if (ce) return json({ error: "Failed to create user" }, 500);

      const uid = created.user.id;
      if (role === "super_admin") {
        await client.rpc("admin_set_user_role", { p_user: uid, p_role: "super_admin" });
      }
      await client.from("audit_log").insert({
        actor_id: (await client.auth.getUser()).data.user?.id,
        action: "user_create", entity_type: "user", entity_id: uid,
        details: { email, role: role ?? "content_editor" },
      }).then(() => {});
      return json({ id: uid, email });
    }

    // PUT /admin-users/:id — update user (role / disabled / password reset)
    if (req.method === "PUT" && path.startsWith("/")) {
      const id = path.slice(1);
      const body = await req.json();
      const { role, disabled, password, full_name } = body;

      if (role !== undefined) {
        const { error } = await client.rpc("admin_set_user_role", { p_user: id, p_role: role });
        if (error) return json({ error: "Failed to set role" }, 500);
      }
      if (disabled !== undefined) {
        const { error } = await client.rpc("admin_set_user_disabled", { p_user: id, p_disabled: disabled });
        if (error) return json({ error: "Failed to update status" }, 500);
      }
      if (full_name !== undefined) {
        await client.from("profiles").update({ full_name }).eq("id", id);
      }
      if (password) {
        if (password.length < 8) return json({ error: "Password must be at least 8 characters" }, 400);
        const { error } = await client.auth.admin.updateUserById(id, { password });
        if (error) return json({ error: "Failed to reset password" }, 500);
      }
      await client.from("audit_log").insert({
        actor_id: (await client.auth.getUser()).data.user?.id,
        action: "user_update", entity_type: "user", entity_id: id,
        details: { role, disabled, full_name: !!full_name, password_reset: !!password },
      }).then(() => {});
      return json({ ok: true });
    }

    // DELETE /admin-users/:id — remove user
    if (req.method === "DELETE" && path.startsWith("/")) {
      const id = path.slice(1);
      const { error } = await client.auth.admin.deleteUser(id);
      if (error) return json({ error: "Failed to delete user" }, 500);
      await client.from("audit_log").insert({
        actor_id: (await client.auth.getUser()).data.user?.id,
        action: "user_delete", entity_type: "user", entity_id: id,
        details: {},
      }).then(() => {});
      return json({ ok: true });
    }

    return json({ error: "Not found" }, 404);
  } catch (err) {
    return json({ error: "Server error" }, 500);
  }
});
