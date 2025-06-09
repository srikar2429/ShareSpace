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

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const { user, register } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form.name, form.username, form.email, form.password);
      showToast("Registration successful! 🎉", "success");
      navigate("/");
    } catch (err) {
      showToast(err.response?.data?.message || "Registration failed!", "error");
    }
  };

  const handleGoogle = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <Paper elevation={5} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Grid container>
          {/* Left Panel */}
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

          {/* Right Panel */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 4, bgcolor: "background.paper" }}>
              <Typography
                variant="h5"
                gutterBottom
                align="center"
                fontWeight={600}
              >
                Create Your Account
              </Typography>

              <form onSubmit={handleSubmit}>
                <Stack spacing={2} mt={2}>
                  <TextField
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
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
                    Register
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
                Already have an account?{" "}
                <Link to="/login" style={{ color: "#1976d2", fontWeight: 500 }}>
                  Login
                </Link>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Register;
