import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', action = null) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, action }]);
    
    // Auto-remove after 5s unless it has an action (like undo)
    if (!action) {
      setTimeout(() => removeToast(id), 5000);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="glass bg-surface-100/90 shadow-2xl rounded-2xl p-4 flex items-start gap-3 border-l-4 border-l-primary-500 overflow-hidden relative group"
              style={{
                borderLeftColor: 
                  toast.type === 'success' ? '#10b981' : 
                  toast.type === 'error' ? '#f43f5e' : '#3b82f6'
              }}
            >
              {/* Subtle ambient glow behind toast icon */}
              <div 
                className="absolute top-1/2 -left-4 -translate-y-1/2 w-12 h-12 rounded-full blur-[20px] opacity-20 pointer-events-none"
                style={{
                  backgroundColor: 
                    toast.type === 'success' ? '#10b981' : 
                    toast.type === 'error' ? '#f43f5e' : '#3b82f6'
                }}
              />
              <div className="flex-shrink-0 mt-0.5 relative z-10">
                {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium">{toast.message}</p>
                {toast.action && (
                  <button 
                    onClick={() => {
                      toast.action.onClick();
                      removeToast(toast.id);
                    }}
                    className="mt-2 text-sm text-primary-400 font-semibold hover:text-primary-300"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button onClick={() => removeToast(toast.id)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
