import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Chat from "./pages/Chat.jsx";
import ForgotPassword from "./components/forgotPassword.jsx";
import ResetPassword from "./components/resetPassword.jsx";
import VideoCall from "./components/videoCall.jsx";
import CollaborativeEditor from "./pages/CollaborativeEditor.jsx";
import Loader from "./components/Loader";
import socket from "./socket.js";
import { useAuth } from "./context/AuthContext";
import {useEffect} from "react";

function App() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      socket.emit("setup", user);
      socket.on("connected", () => {
        console.log("Socket connected");
      });
    }

    return () => {
      socket.off("connected");
    };
  }, [user]);

  return (
    <Router>
      <Loader />
      <Routes>
        <Route path="/" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/video-call/:chatId" element={<VideoCall />} />
        <Route path="/document/:id" element={<CollaborativeEditor />} />
      </Routes>
    </Router>
  );
}

export default App
