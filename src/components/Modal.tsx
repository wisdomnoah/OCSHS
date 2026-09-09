import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, children, maxWidth = 'max-w-2xl' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-md animate-fadeUp" />
      <div className={`relative w-full ${maxWidth} animate-fadeUp`} onClick={(e) => e.stopPropagation()}>
        {children}
        <button onClick={onClose} aria-label="Close"
          className="absolute -top-3 -right-3 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-ink-900 text-cream transition hover:border-lilac/50 hover:text-lilac-300">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
