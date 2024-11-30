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

interface ApplicationSuccessModalProps {
  open: boolean;
  onClose: () => void;
  eventName: string;
}

const ApplicationSuccessModal: React.FC<ApplicationSuccessModalProps> = ({ 
  open, 
  onClose, 
  eventName 
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ textAlign: 'center' }}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
      </DialogTitle>
      <DialogContent>
        <Typography variant="h6" align="center">
          Application Submitted Successfully!
        </Typography>
        <Typography color="text.secondary" align="center" sx={{ mt: 1 }}>
          You have successfully applied to {eventName}.
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

export default ApplicationSuccessModal;