import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  styled
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { getUserNotifications, Notification } from '../api/notificationsApi';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

interface NotificationItemProps {
  message: string;
  created_at: string;
  is_read: boolean;
  event_id: number | null;
  onClick: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ message, created_at, is_read, event_id, onClick }) => (
  <ListItem 
    onClick={onClick}
    sx={{ 
      bgcolor: is_read ? 'transparent' : 'action.hover',
      borderBottom: '1px solid',
      borderColor: 'divider',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        bgcolor: 'action.selected',
        transform: 'translateX(4px)'
      }
    }}
  >
    <ListItemText
      primary={message}
      secondary={
        <>
          {new Date(created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
          {event_id === null && (
            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              (No event linked)
            </Typography>
          )}
        </>
      }
      primaryTypographyProps={{
        sx: { fontWeight: is_read ? 'normal' : 'bold' }
      }}
    />
  </ListItem>
);

const NotificationsMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // The open state for the popover
  const open = Boolean(anchorEl);
  
  // Always fetch notifications on component mount
  const { 
    data: notifications = [], 
    isLoading: isLoadingDetails, 
    isError 
  } = useQuery(
    'notifications', 
    getUserNotifications,
    {
      // Enable fetching on component mount regardless of popover state
      // This ensures we get the notification count immediately
      staleTime: 300000, // 5 minutes
      refetchOnWindowFocus: false
    }
  );

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    // Refresh notifications when opening the menu to ensure data is fresh
    queryClient.invalidateQueries('notifications');
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log(`Clicked on notification ${notification.id}`);
    
    // Navigate to event page if notification has an event_id
    if (notification.event_id) {
      navigate(`/event-page/${notification.event_id}`);
      handleClose(); // Close the notification menu after navigating
    } else {
      console.log('This notification has no associated event');
      // You could add a toast notification here
    }
  };

  // Determine if we're loading the initial badge count
  const isLoadingBadge = notifications.length === 0 && !isError;

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          bgcolor: 'background.paper',
          borderRadius: '50%',
          boxShadow: 2,
          '&:hover': {
            bgcolor: 'background.paper',
          }
        }}
      >
        {isLoadingBadge ? (
          <CircularProgress size={24} />
        ) : (
          <StyledBadge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </StyledBadge>
        )}
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { 
            width: 360,
            maxHeight: 480,
            overflow: 'auto'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>

        {isLoadingDetails && open ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Box sx={{ p: 2 }}>
            <Typography color="error">Failed to load notifications</Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography color="textSecondary">No notifications</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                message={notification.message}
                created_at={notification.created_at}
                is_read={notification.is_read}
                event_id={notification.event_id}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </List>
        )}
      </Popover>
    </>
  );
};

export default NotificationsMenu;