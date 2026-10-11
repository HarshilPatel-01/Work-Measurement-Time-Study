'use client';

import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

interface ToastContextType {
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType>({
  toast: () => {},
  dismiss: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...t, id }]);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map(t => (
          <ToastPrimitive.Root
            key={t.id}
            duration={t.duration ?? 4000}
            onOpenChange={open => !open && dismiss(t.id)}
            className={cn(
              'fixed bottom-4 right-4 z-50 flex flex-col gap-1 rounded-xl border p-4 shadow-xl',
              'data-[state=open]:animate-slide-up data-[state=closed]:animate-fade-out',
              'min-w-[300px] max-w-[420px]',
              {
                'bg-card border-border text-foreground': t.variant === 'default' || !t.variant,
                'bg-destructive border-destructive text-white': t.variant === 'destructive',
                'bg-teal-900 border-teal-700 text-white': t.variant === 'success',
              }
            )}
          >
            <ToastPrimitive.Title className="font-semibold text-sm">
              {t.title}
            </ToastPrimitive.Title>
            {t.description && (
              <ToastPrimitive.Description className="text-sm opacity-80">
                {t.description}
              </ToastPrimitive.Description>
            )}
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return React.useContext(ToastContext);
}
