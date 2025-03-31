import React from 'react';
import { 
  Snackbar, 
  Alert, 
  AlertColor, 
  Typography,
  Box,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface FeedbackSnackbarProps {
  open: boolean;
  message: string;
  severity: AlertColor;
  onClose: () => void;
}

const FeedbackSnackbar: React.FC<FeedbackSnackbarProps> = ({
  open,
  message,
  severity,
  onClose
}) => {
  const icon = severity === 'success' ? (
    <CheckCircleIcon fontSize="medium" />
  ) : (
    <CancelIcon fontSize="medium" />
  );

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity={severity}
        variant="filled"
        sx={{ 
          width: '100%', 
          minWidth: '300px',
          boxShadow: 3,
          '& .MuiAlert-icon': {
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.25rem'
          }
        }}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={onClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {message}
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default FeedbackSnackbar;