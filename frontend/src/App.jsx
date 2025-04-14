import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Chat from "./pages/Chat.jsx";
import Loader from "./components/Loader";
import socket from "./socket.js";
import { useAuth } from "./context/AuthContext";
import {useEffect} from "react";

function App() {
  const { user } = useAuth();

  useEffect(() => {
    console.log("hi")
    if (user) {
      console.log("1")
      socket.emit("setup", user);
      socket.on("connected", () => {
        console.log("Socket connected");
      });
    }
  }, [user]);

  return (
    <Router>
      <Loader />
      <Routes>
        <Route path="/" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App
