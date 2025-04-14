import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    setAnchorEl(null);
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: "100%",
        top: 0,
        left: 0,
        padding: "10px 0",
        backgroundColor: "#1976d2",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          paddingX: 4,
        }}
      >
        <Typography variant="h5" sx={{ fontSize: "2rem", fontWeight: "bold" }}>
          Connected
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
          {["chat", "files", "documents"].map((item) => (
            <Button
              key={item}
              sx={{
                color: "white",
                fontSize: "1.1rem",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.2)",
                },
              }}
              onClick={() => navigate(`/${item}`)}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Button>
          ))}

          {isAuthenticated ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar sx={{ width: 40, height: 40 }} src={user?.pic} />
              <Typography
                sx={{
                  color: "white",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                }}
              >
                {user?.name}
              </Typography>
              <Button
                sx={{
                  color: "white",
                  fontSize: "1.5rem",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.2)",
                  },
                }}
                onClick={handleMenuClick}
              >
                <ArrowDropDownIcon />
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                PaperProps={{
                  component: Paper,
                  elevation: 4,
                  sx: {
                    mt: 1.5,
                    borderRadius: 2,
                    minWidth: 160,
                    paddingY: 0.5,
                  },
                }}
              >
                <MenuItem onClick={() => navigate("/profile")}>
                  Profile
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {["login", "register"].map((item) => (
                <Button
                  key={item}
                  sx={{
                    color: "white",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.2)",
                    },
                  }}
                  onClick={() => navigate(`/${item}`)}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Button>
              ))}
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
