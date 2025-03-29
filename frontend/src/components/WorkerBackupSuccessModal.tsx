import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  useTheme
} from '@mui/material';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';

interface WorkerBackupSuccessModalProps {
  open: boolean;
  onClose: () => void;
  workerName: string;
  jobTitle: string;
}

const WorkerBackupSuccessModal: React.FC<WorkerBackupSuccessModalProps> = ({
  open,
  onClose,
  workerName,
  jobTitle
}) => {
  const theme = useTheme();

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1
        }
      }}
    >
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: theme.palette.info.main, 
              width: 60, 
              height: 60, 
              mx: 'auto',
              mb: 2
            }}
          >
            <AccessTimeOutlinedIcon fontSize="large" />
          </Avatar>
          
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Worker Added to Backup List
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2, color: theme.palette.text.secondary }}>
            <strong>{workerName}</strong> has been added to the waiting list as backup for the <strong>{jobTitle}</strong> position.
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2, color: theme.palette.info.dark, px: 3 }}>
            This worker will be contacted if approved workers become unavailable.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          color="primary"
          sx={{ 
            borderRadius: 1.5,
            px: 4,
            py: 1
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkerBackupSuccessModal;