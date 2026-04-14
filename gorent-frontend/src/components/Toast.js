import { useState, createContext, useContext, useCallback, useMemo, useRef } from "react";

// Toast Context
const ToastContext = createContext(null);

// Toast Provider
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const dedupeRegistryRef = useRef({});

  const pushToast = useCallback((message, type = "success", duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const addNotification = useCallback((
    message,
    type = "info",
    options = {}
  ) => {
    if (!message) return null;

    const {
      title = "",
      showToast = false,
      duration = 4000,
      dedupeKey = ""
    } = options;

    if (dedupeKey) {
      const now = Date.now();
      const lastLoggedAt = dedupeRegistryRef.current[dedupeKey];
      if (lastLoggedAt && now - lastLoggedAt < 5000) {
        return null;
      }
      dedupeRegistryRef.current[dedupeKey] = now;
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setNotifications((prev) => ([
      {
        id,
        title,
        message,
        type,
        read: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ].slice(0, 80)));

    if (showToast) {
      pushToast(message, type, duration);
    }

    return id;
  }, [pushToast]);

  const addToast = useCallback((message, type = "success", duration = 4000) => {
    addNotification(message, type, {
      showToast: true,
      duration
    });
  }, [addNotification]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => prev.map((item) => (
      item.id === id ? { ...item, read: true } : item
    )));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  return (
    <ToastContext.Provider value={{
      addToast,
      addNotification,
      notifications,
      unreadCount,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications
    }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Toast Container
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <div className="toast-icon">
            {toast.type === "success" && "✓"}
            {toast.type === "error" && "✕"}
            {toast.type === "warning" && "⚠"}
            {toast.type === "info" && "ℹ"}
          </div>
          <div className="toast-message">{toast.message}</div>
          <button className="toast-close" onClick={(e) => {
            e.stopPropagation();
            removeToast(toast.id);
          }}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastProvider;
