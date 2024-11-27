import React from "react";
import { Button, CircularProgress } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"; // A spark-like icon for AI
import { styled } from "@mui/system";

interface GenerateButtonProps {
  onClick: () => void;
  loading?: boolean; // Optional loading state for when AI is generating
}

const StyledButton = styled(Button)({
  textTransform: "none", // Keep text case as-is
  fontWeight: 600,
  padding: "10px 20px",
  background: "linear-gradient(45deg, #2196f3, #21cbf3)", // A sparkly blue gradient
  color: "white",
  "&:hover": {
    background: "linear-gradient(45deg, #1976d2, #1e88e5)", // Darker blue for hover
  },
});

const GenerateButton: React.FC<GenerateButtonProps> = ({ onClick, loading }) => {
  return (
    <StyledButton
      variant="contained"
      startIcon={!loading && <AutoAwesomeIcon />}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : "Generate with AI"}
    </StyledButton>
  );
};

export default GenerateButton;
