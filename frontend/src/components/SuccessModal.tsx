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

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
}

const SuccessModal: React.FC<SuccessModalProps> = ({ open, onClose, mode = 'create' }) => {
  const title = mode === 'create' ? 'Event Created Successfully!' : 'Event Edited Successfully!';
  const message = mode === 'create' 
    ? 'Your event has been added to the system.'
    : 'Your event has been updated successfully.';

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ textAlign: 'center' }}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
      </DialogTitle>
      <DialogContent>
        <Typography variant="h6" align="center">
          {title}
        </Typography>
        <Typography color="text.secondary" align="center" sx={{ mt: 1 }}>
          {message}
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

export default SuccessModal;