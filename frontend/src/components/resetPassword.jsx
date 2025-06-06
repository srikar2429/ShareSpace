import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  const [form, setForm] = useState({
    password: "",
    passwordConfirm: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `http://nginx:8080/api/users/resetPassword/${token}`,
        form
      );
      showToast("Password reset successful! 🎉", "success");
      navigate("/login");
    } catch (err) {
      showToast(err.response?.data?.message || "Reset failed", "error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Reset Your Password
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2} mt={2}>
            <TextField
              label="New Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Confirm Password"
              name="passwordConfirm"
              type="password"
              value={form.passwordConfirm}
              onChange={handleChange}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" fullWidth>
              Reset Password
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default ResetPassword;
