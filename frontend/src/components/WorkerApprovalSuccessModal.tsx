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

interface WorkerApprovalSuccessModalProps {
  open: boolean;
  onClose: () => void;
  workerName: string;
  jobTitle: string;
}

const WorkerApprovalSuccessModal: React.FC<WorkerApprovalSuccessModalProps> = ({ 
  open, 
  onClose, 
  workerName, 
  jobTitle 
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ textAlign: 'center' }}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
      </DialogTitle>
      <DialogContent>
        <Typography variant="h6" align="center">
          Worker Approved Successfully!
        </Typography>
        <Typography color="text.secondary" align="center" sx={{ mt: 1 }}>
          You have approved {workerName} for the job: {jobTitle}.
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

export default WorkerApprovalSuccessModal;