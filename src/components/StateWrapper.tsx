import { type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface StateWrapperProps {
  loading: boolean;
  error: string | null;
  empty?: ReactNode;
  children: ReactNode;
}

export function StateWrapper({ loading, error, empty, children }: StateWrapperProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3 text-cream/50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-lilac" />
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }
  return <>{empty ?? children}</>;
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 h-12 w-12 rounded-full border border-white/10 bg-white/5" />
      <p className="text-sm text-cream/50">{message}</p>
    </div>
  );
}
