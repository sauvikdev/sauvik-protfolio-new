import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                className="pointer-events-auto relative flex items-start gap-3 w-full bg-[#09090b]/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl overflow-hidden group"
                style={{
                  boxShadow: isSuccess 
                    ? '0 10px 30px -10px rgba(16, 185, 129, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
                    : isError
                    ? '0 10px 30px -10px rgba(239, 68, 68, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
                    : '0 10px 30px -10px rgba(59, 130, 246, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
                }}
              >
                {/* Visual accent left line */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    isSuccess ? 'bg-emerald-500' : isError ? 'bg-red-500' : 'bg-sky-400'
                  }`} 
                />

                <div className="flex-shrink-0 mt-0.5 ml-1">
                  {isSuccess ? (
                    <CheckCircle className="text-emerald-500" size={18} />
                  ) : isError ? (
                    <AlertCircle className="text-red-500" size={18} />
                  ) : (
                    <Info className="text-sky-400" size={18} />
                  )}
                </div>

                <div className="flex-grow">
                  <p className="text-xs text-white/95 font-medium leading-relaxed">
                    {toast.message}
                  </p>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 text-white/40 hover:text-white transition-colors p-0.5 rounded-md hover:bg-white/5"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
