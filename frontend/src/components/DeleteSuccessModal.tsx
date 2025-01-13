import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface DeleteSuccessModalProps {
  open: boolean;
  onClose: () => void;
}

const DeleteSuccessModal: React.FC<DeleteSuccessModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ textAlign: 'center' }}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
      </DialogTitle>
      <DialogContent>
        <Typography variant="h6" align="center">
          Event Deleted Successfully!
        </Typography>
        <Typography color="text.secondary" align="center" sx={{ mt: 1 }}>
          The event has been removed from the system.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteSuccessModal;