import { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const showToast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/users/forgotPassword", {
        email,
      });
      showToast("Reset link sent! Check your email 📩", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong", "error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Forgot Password
        </Typography>
        <Typography variant="body2" gutterBottom>
          Enter your email and we’ll send you a reset link.
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2} mt={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" fullWidth>
              Send Reset Link
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
