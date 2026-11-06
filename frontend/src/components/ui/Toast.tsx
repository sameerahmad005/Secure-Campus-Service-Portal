import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (title: string, options?: { description?: string; tone?: ToastTone }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, { icon: React.ElementType; color: string }> = {
  success: { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' },
  error: { icon: AlertCircle, color: 'text-rose-600 dark:text-rose-400' },
  info: { icon: Info, color: 'text-campus-700 dark:text-campus-400' },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue['toast']>(
    (title, options) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev.slice(-2), { id, title, description: options?.description, tone: options?.tone ?? 'success' }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed z-[60] bottom-20 lg:bottom-6 inset-x-4 sm:inset-x-auto sm:right-6 sm:w-96 flex flex-col gap-2 pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const { icon: Icon, color } = toneStyles[t.tone];
          return (
            <div
              key={t.id}
              className="pointer-events-auto animate-toast-in flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-xl shadow-slate-900/10"
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{t.title}</p>
                {t.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="p-1 -m-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
