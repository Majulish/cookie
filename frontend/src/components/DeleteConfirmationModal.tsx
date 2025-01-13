import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventName: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  open, 
  onClose, 
  onConfirm, 
  eventName 
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      aria-labelledby="delete-confirmation-dialog-title"
      aria-describedby="delete-confirmation-dialog-description"
    >
      <DialogTitle 
        id="delete-confirmation-dialog-title" 
        sx={{ textAlign: 'center' }}
      >
        <WarningAmberIcon 
          color="warning" 
          sx={{ fontSize: 48, mb: 1 }} 
        />
      </DialogTitle>
      <DialogContent>
        <Typography 
          variant="h6" 
          align="center" 
          id="delete-confirmation-dialog-description"
        >
          Delete Event?
        </Typography>
        <Typography 
          color="text.secondary" 
          align="center" 
          sx={{ mt: 1 }}
        >
          Are you sure you want to delete the event "{eventName}"?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 1 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="error"
          autoFocus
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationModal;