import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Typography,
  Box,
  Grid,
  Divider,
  useTheme,
  IconButton,
  Chip
} from '@mui/material';
import { 
  Close as CloseIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { MyEventScheme } from '../home/create_event/eventScheme';
import useUserRole from '../home/hooks/useUserRole';

interface EventDetailsModalProps {
  event: MyEventScheme | null;
  open: boolean;
  onClose: () => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, open, onClose }) => {
  const theme = useTheme();
  const userRole = useUserRole();

  if (!event) return null;

  // Format date and time nicely
  const formatDateTime = (date: string, time: string) => {
    return `${date}, ${time}`;
  };

  // Get the chip color based on worker status
  const getStatusColor = (status: string) => {
    switch(status.toUpperCase()) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{ 
        backgroundColor: theme.palette.primary.main, 
        color: theme.palette.primary.contrastText,
        py: 2,
        px: 3,
        position: 'relative'
      }}>
        <IconButton 
          sx={{ 
            position: 'absolute', 
            right: 8, 
            top: 8, 
            color: 'white' 
          }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
        
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {event.name}
        </Typography>
      </Box>
      
      <DialogContent sx={{ p: 3 }}>
        {/* Worker Status (only shown for workers) */}
        {userRole === 'worker' && event.worker_status && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <AssignmentIcon sx={{ mr: 2, color: theme.palette.primary.main, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Application Status
                </Typography>
                
                <Chip 
                  label={event.worker_status} 
                  color={getStatusColor(event.worker_status)} 
                  size="medium"
                  sx={{ 
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}
        
        {/* Date and Time Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <TimeIcon sx={{ mr: 2, color: theme.palette.primary.main, mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                Date & Time
              </Typography>
              
              <Typography variant="body1">
                Start: {formatDateTime(event.start_date, event.start_time)}
              </Typography>
              
              <Typography variant="body1">
                End: {formatDateTime(event.end_date, event.end_time)}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Location Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <LocationIcon sx={{ mr: 2, color: theme.palette.primary.main, mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                Location
              </Typography>
              
              <Typography variant="body1">
                {event.address}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                {event.city}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Description Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <InfoIcon sx={{ mr: 2, color: theme.palette.primary.main, mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Description
              </Typography>
              
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {event.description}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventDetailsModal;