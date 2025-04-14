import { createContext, useContext } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const showToast = (message, type = "info") => {
    if (type === "success") toast.success(message);
    else if (type === "error") toast.error(message);
    else if (type === "warn") toast.warn(message);
    else toast.info(message);
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <ToastContainer position="top-right" autoClose={3000} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
