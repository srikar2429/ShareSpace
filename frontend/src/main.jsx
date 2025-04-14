import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastProvider } from "./context/ToastContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { LoadingProvider } from "./context/LoadingContext.jsx";
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LoadingProvider>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </LoadingProvider>
  </StrictMode>
);
