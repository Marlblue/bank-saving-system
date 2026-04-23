import { createContext, useContext, useState, useCallback } from 'react';
import { HiX, HiCheckCircle, HiExclamationCircle, HiInformationCircle } from 'react-icons/hi';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const icons = {
  success: <HiCheckCircle style={{ color: '#10b981', fontSize: '1.25rem', flexShrink: 0 }} />,
  error: <HiExclamationCircle style={{ color: '#ef4444', fontSize: '1.25rem', flexShrink: 0 }} />,
  warning: <HiExclamationCircle style={{ color: '#f59e0b', fontSize: '1.25rem', flexShrink: 0 }} />,
  info: <HiInformationCircle style={{ color: '#3b82f6', fontSize: '1.25rem', flexShrink: 0 }} />,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {icons[toast.type]}
            <span>{toast.message}</span>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <HiX />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
