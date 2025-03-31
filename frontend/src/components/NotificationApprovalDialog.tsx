import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Typography,
  Box,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Notification } from '../api/notificationsApi';

interface NotificationApprovalDialogProps {
  notification: Notification | null;
  open: boolean;
  onClose: () => void;
  onApprove: (id: number) => void;
  onDeny: (id: number) => void;
}

const NotificationApprovalDialog: React.FC<NotificationApprovalDialogProps> = ({
  notification,
  open,
  onClose,
  onApprove,
  onDeny
}) => {
  const theme = useTheme();

  if (!notification) {
    return null;
  }

  const formattedDate = new Date(notification.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  const formattedTime = new Date(notification.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleApprove = () => {
    onApprove(notification.id);
    onClose();
  };

  const handleDeny = () => {
    onDeny(notification.id);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="notification-approval-dialog-title"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 5,
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        id="notification-approval-dialog-title"
        sx={{ 
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
          px: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <NotificationImportantIcon 
            sx={{ 
              color: 'primary.main',
              mr: 1.5,
              fontSize: '1.5rem'
            }} 
          />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Notification Approval Required
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 3, px: 3 }}>
        <Box sx={{ display: 'flex', mb: 3 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.light',
              color: 'primary.dark',
              mr: 2
            }}
          >
            {notification.event_id ? <EventIcon /> : <NotificationImportantIcon />}
          </Avatar>
          
          <Box>
            <DialogContentText 
              sx={{ 
                color: 'text.primary', 
                fontWeight: 500,
                fontSize: '1.1rem',
                mb: 0.5
              }}
            >
              {notification.message}
            </DialogContentText>
            
            <Typography variant="body2" color="text.secondary">
              {formattedDate} • {formattedTime}
            </Typography>
          </Box>
        </Box>

        <DialogContentText sx={{ mb: 2 }}>
          Do you want to approve or deny this notification?
        </DialogContentText>
        
        {notification.event_id && (
          <Typography variant="body2" sx={{ color: 'primary.main', mt: 1 }}>
            This notification is related to an event. Your action will determine if it should be added to your notifications.
          </Typography>
        )}
      </DialogContent>

      <DialogActions 
        sx={{ 
          px: 3, 
          py: 2, 
          bgcolor: alpha(theme.palette.background.default, 0.5),
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Button 
          onClick={onClose} 
          color="inherit"
          variant="text"
        >
          Cancel
        </Button>
        
        <Box>
          <Button 
            onClick={handleDeny} 
            color="error" 
            variant="outlined"
            startIcon={<CancelIcon />}
            sx={{ mr: 1 }}
          >
            Decline
          </Button>
          
          <Button 
            onClick={handleApprove} 
            color="primary" 
            variant="contained"
            startIcon={<CheckCircleIcon />}
          >
            Approve
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationApprovalDialog;