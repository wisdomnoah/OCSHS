import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import { useRoute, navigate, isAdminRoute } from '@/lib/router';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BrandPattern } from '@/components/BrandPattern';
import { AdminLogin } from '@/pages/admin/AdminLogin';
import { AdminApp } from '@/pages/admin/AdminApp';
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';
import { AnnouncementsPage } from '@/pages/AnnouncementsPage';
import { GalleryPage } from '@/pages/GalleryPage';
import { StaffPage } from '@/pages/StaffPage';
import { AwardsPage } from '@/pages/AwardsPage';
import { ProgramsPage } from '@/pages/ProgramsPage';
import { ContactPage } from '@/pages/ContactPage';

function PublicPages() {
  const path = useRoute();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [path]);

  switch (path) {
    case '/about': return <AboutPage />;
    case '/announcements': return <AnnouncementsPage />;
    case '/gallery': return <GalleryPage />;
    case '/staff': return <StaffPage />;
    case '/awards': return <AwardsPage />;
    case '/programs': return <ProgramsPage />;
    case '/contact': return <ContactPage />;
    default: return <HomePage />;
  }
}

function AdminRoute() {
  const { session, loading, isStaff } = useAuth();
  const path = useRoute();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-lilac" />
      </div>
    );
  }

  // Not logged in → login page (any /admin/* route)
  if (!session) {
    return <AdminLogin />;
  }

  // Logged in but not staff → show access denied
  if (!isStaff) {
    return (
      <div className="relative min-h-screen pt-16">
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-semibold text-white">Access Denied</h1>
          <p className="mt-3 text-sm text-cream/60">Your account does not have admin access. Contact your administrator.</p>
          <button onClick={() => navigate('/')} className="btn-ghost mt-6">Back to website</button>
        </div>
      </div>
    );
  }

  return <AdminApp route={path} />;
}

function Shell() {
  const path = useRoute();
  const isAdmin = isAdminRoute(path);
  return (
    <div className="relative min-h-screen">
      <BrandPattern />
      <div className="relative z-10">
        {!isAdmin && <Navbar />}
        {isAdmin ? <AdminRoute /> : <PublicPages />}
        {!isAdmin && <Footer />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </ThemeProvider>
  );
}
