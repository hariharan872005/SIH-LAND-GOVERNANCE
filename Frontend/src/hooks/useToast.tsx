import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X, Trash2, UserPlus, ShieldCheck } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'deleted';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (title: string, message?: string) => void;
  deleted: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = 'info', duration = 4500 }: Omit<ToastItem, 'id'>) => {
      const id = `toast_${Date.now()}_${Math.random()}`;
      const newToast: ToastItem = { id, title, message, type, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => addToast({ title, message, type: 'success' }), [addToast]);
  const deleted = useCallback((title: string, message?: string) => addToast({ title, message, type: 'deleted' }), [addToast]);
  const error = useCallback((title: string, message?: string) => addToast({ title, message, type: 'error' }), [addToast]);
  const warning = useCallback((title: string, message?: string) => addToast({ title, message, type: 'warning' }), [addToast]);
  const info = useCallback((title: string, message?: string) => addToast({ title, message, type: 'info' }), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, deleted, error, warning, info }}>
      {children}
      
      {/* Prominent Toast Notification Container */}
      <aside aria-label="Notifications" className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0 animate-in fade-in slide-in-from-top-4 duration-300">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-0 text-slate-900 ${
              t.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-emerald-900/10'
                : t.type === 'deleted'
                ? 'bg-rose-50/95 border-rose-300 text-rose-950 shadow-rose-900/10'
                : t.type === 'error'
                ? 'bg-rose-50/95 border-rose-300 text-rose-950 shadow-rose-900/10'
                : t.type === 'warning'
                ? 'bg-amber-50/95 border-amber-300 text-amber-950 shadow-amber-900/10'
                : 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-900/10'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              {t.type === 'deleted' && (
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-sm">
                  <Trash2 className="w-4.5 h-4.5" />
                </div>
              )}
              {t.type === 'error' && (
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
                  <XCircle className="w-5 h-5" />
                </div>
              )}
              {t.type === 'warning' && (
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                  <AlertTriangle className="w-4.5 h-4.5" />
                </div>
              )}
              {t.type === 'info' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                  <Info className="w-4.5 h-4.5" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  t.type === 'success'
                    ? 'bg-emerald-200 text-emerald-900 font-bold'
                    : t.type === 'deleted'
                    ? 'bg-rose-200 text-rose-900 font-bold'
                    : t.type === 'error'
                    ? 'bg-rose-200 text-rose-900 font-bold'
                    : t.type === 'warning'
                    ? 'bg-amber-200 text-amber-900 font-bold'
                    : 'bg-slate-200 text-slate-900 font-bold'
                }`}>
                  {t.type === 'deleted' ? 'Deleted' : t.type === 'success' ? 'Created / Success' : t.type}
                </span>
              </div>
              <p className="text-sm font-black tracking-tight text-slate-900 mt-1">{t.title}</p>
              {t.message && <p className="text-xs text-slate-700 mt-0.5 leading-relaxed font-medium">{t.message}</p>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-black/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
