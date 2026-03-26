import { createContext, useContext, useCallback, useState } from 'react';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("UseAlert must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);
  const showAlert = useCallback((message, type, options = {}) => {
    setAlert({
      message,
      type,
      mode: options.mode || "inline",
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null,
      confirmText: options.confirmText || "confirm",
      cancelText: options.cancelText || "cancel"
    });
  }, []);
  const hideAlert = useCallback(() => setAlert(null), []);
  const handleConfirm = useCallback(() => {
    if (alert?.onConfirm) alert.onConfirm();
    hideAlert();
  }, [alert, hideAlert]);
  const handleCancel = useCallback(() => {
    if (alert?.onCancel) alert.onCancel();
    hideAlert();
  },[alert, hideAlert])
  return (
    <AlertContext.Provider value={{alert, showAlert, hideAlert, handleConfirm, handleCancel}}>
      {children}
    </AlertContext.Provider>
  );
};