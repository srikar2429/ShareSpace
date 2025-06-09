import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Stack,
  Divider,
  Paper,
  Grid,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });

  const { user, login, isAuthenticated } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      showToast("Welcome back! 🎉", "success");
      navigate("/");
    } catch (err) {
      showToast(err.response?.data?.message || "Login failed!", "error");
    }
  };

  const handleGoogle = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <Paper elevation={5} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Grid container>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 4,
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h3"
              fontWeight="bold"
              gutterBottom
              sx={{
                transition: "transform 0.3s",
                ":hover": { transform: "scale(1.05)" },
              }}
            >
              Connected
            </Typography>
            <Typography variant="subtitle1" align="center">
              Collaborate. Communicate. Create.
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ p: 4, bgcolor: "background.paper" }}>
              <Typography
                variant="h5"
                gutterBottom
                align="center"
                fontWeight={600}
              >
                Welcome Back
              </Typography>

              <form onSubmit={handleSubmit}>
                <Stack spacing={2} mt={2}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    fullWidth
                    required
                  />

                  <Box textAlign="right">
                    <Link
                      to="/forgot-password"
                      style={{ fontSize: "0.9rem", color: "#1976d2" }}
                    >
                      Forgot Password?
                    </Link>
                  </Box>

                  <Button
                    variant="contained"
                    type="submit"
                    size="large"
                    sx={{
                      transition: "all 0.3s",
                      ":hover": {
                        transform: "scale(1.03)",
                        boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
                      },
                    }}
                  >
                    Login
                  </Button>
                </Stack>
              </form>

              <Divider sx={{ my: 3 }}>OR</Divider>

              <Button
                variant="outlined"
                fullWidth
                onClick={handleGoogle}
                size="large"
                sx={{
                  transition: "all 0.3s",
                  ":hover": {
                    transform: "scale(1.03)",
                    boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
                  },
                }}
              >
                Continue with Google
              </Button>

              <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                Don’t have an account?{" "}
                <Link
                  to="/register"
                  style={{ color: "#1976d2", fontWeight: 500 }}
                >
                  Register
                </Link>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Login;
