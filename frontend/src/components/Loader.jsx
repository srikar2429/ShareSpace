import { useLoading } from "../context/LoadingContext";
import { Backdrop, CircularProgress, Box, Typography } from "@mui/material";

const Loader = () => {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <Backdrop
      open={true}
      sx={{
        color: "#000",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          bgcolor: "white",
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6" mt={2} color="black">
          Loading...
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default Loader;
