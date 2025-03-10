import React, { useState, useEffect } from 'react';
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
  styled,
  Avatar,
  Divider,
  Fab,
  Tooltip,
  Zoom,
  Button,
  ListItemAvatar,
  alpha,
  useTheme
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import EventIcon from '@mui/icons-material/Event';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { getUserNotifications, Notification } from '../api/notificationsApi';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
    minWidth: '18px',
    height: '18px',
    fontSize: '0.65rem',
    fontWeight: 'bold',
  },
}));

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const theme = useTheme();
  const { message, created_at, is_read, event_id } = notification;
  
  // Format the date
  const formattedDate = new Date(created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  // Format the time
  const formattedTime = new Date(created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <ListItem 
      onClick={onClick}
      sx={{ 
        px: 2,
        py: 1.5,
        bgcolor: is_read ? 'transparent' : alpha(theme.palette.primary.light, 0.08),
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.light, 0.12),
        },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {!is_read && (
        <Box 
          sx={{ 
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            bgcolor: 'primary.main'
          }}
        />
      )}
      
      <ListItemAvatar>
        <Avatar 
          sx={{ 
            bgcolor: is_read ? 'grey.200' : 'primary.light',
            color: is_read ? 'text.secondary' : 'primary.dark'
          }}
        >
          {event_id ? <EventIcon /> : <NotificationImportantIcon />}
        </Avatar>
      </ListItemAvatar>
      
      <ListItemText
        primary={
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: is_read ? 400 : 600,
              mb: 0.5,
              color: is_read ? 'text.primary' : 'text.primary'
            }}
          >
            {message}
          </Typography>
        }
        secondary={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {formattedDate} • {formattedTime}
            </Typography>
            
            {event_id && (
              <Button 
                size="small" 
                variant="text" 
                color="primary"
                sx={{ 
                  minWidth: 'auto', 
                  p: 0,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  ml: 1
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                View
              </Button>
            )}
          </Box>
        }
      />
    </ListItem>
  );
};

const NOTIFICATION_REFETCH_INTERVAL = 60000; // 1 minute

const NotificationsMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // The open state for the popover
  const open = Boolean(anchorEl);
  
  // Always fetch notifications on component mount
  const { 
    data: notifications = [], 
    isLoading,
    isError,
    refetch
  } = useQuery(
    'notifications', 
    getUserNotifications,
    {
      staleTime: NOTIFICATION_REFETCH_INTERVAL,
      refetchInterval: NOTIFICATION_REFETCH_INTERVAL,
      refetchOnWindowFocus: true
    }
  );

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    // Refresh notifications when opening the menu
    refetch();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Navigate to event page if notification has an event_id
    if (notification.event_id) {
      navigate(`/event-page/${notification.event_id}`);
      handleClose(); // Close the notification menu after navigating
    } else {
      console.log('This notification has no associated event');
    }
  };

  const handleMarkAllAsRead = () => {
    // This would typically call an API endpoint to mark all as read
    console.log('Mark all as read');
    // For now, we'll just close the menu
    handleClose();
  };

  return (
    <>
      <Tooltip 
        title={`${unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'No new notifications'}`}
        placement="left"
        TransitionComponent={Zoom}
      >
        <Fab
          size="medium"
          color={unreadCount > 0 ? "primary" : "default"}
          aria-label="notifications"
          onClick={handleClick}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            boxShadow: 3,
            color: unreadCount > 0 ? 'white' : 'action.active',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: 4
            }
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <StyledBadge badgeContent={unreadCount} color="error" max={99}>
              {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
            </StyledBadge>
          )}
        </Fab>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 4,
          sx: { 
            width: 360,
            maxHeight: 480,
            overflow: 'hidden',
            borderRadius: 2
          }
        }}
      >
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : alpha(theme.palette.primary.main, 0.03),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationsIcon 
              sx={{ 
                color: 'primary.main',
                mr: 1.5,
                fontSize: '1.25rem'
              }} 
            />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
              {unreadCount > 0 && (
                <Typography 
                  component="span" 
                  variant="caption" 
                  sx={{ 
                    ml: 1, 
                    color: 'primary.main',
                    fontWeight: 'bold',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    px: 1,
                    py: 0.5,
                    borderRadius: 1
                  }}
                >
                  {unreadCount} new
                </Typography>
              )}
            </Typography>
          </Box>
          
          <IconButton
            size="small"
            onClick={handleClose}
            aria-label="close"
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {isLoading ? (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              flexDirection: 'column',
              p: 4,
              height: 200
            }}
          >
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading notifications...
            </Typography>
          </Box>
        ) : isError ? (
          <Box 
            sx={{ 
              p: 3,
              textAlign: 'center'
            }}
          >
            <Typography 
              color="error" 
              variant="body2" 
              sx={{ mb: 2 }}
            >
              Failed to load notifications
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </Box>
        ) : notifications.length === 0 ? (
          <Box 
            sx={{ 
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200
            }}
          >
            <NotificationsNoneIcon 
              sx={{ 
                fontSize: 48, 
                color: 'text.disabled',
                mb: 2
              }} 
            />
            <Typography color="text.secondary" variant="body1" align="center">
              No notifications yet
            </Typography>
            <Typography color="text.secondary" variant="body2" align="center" sx={{ mt: 1 }}>
              We'll notify you when something important happens
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ overflow: 'auto', maxHeight: 'calc(480px - 60px - 48px)' }}>
              <List disablePadding>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
              </List>
            </Box>
            
            {unreadCount > 0 && (
              <Box 
                sx={{ 
                  p: 1.5, 
                  borderTop: '1px solid', 
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Button
                  size="small"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleMarkAllAsRead}
                  sx={{ fontWeight: 500 }}
                >
                  Mark all as read
                </Button>
              </Box>
            )}
          </>
        )}
      </Popover>
    </>
  );
};

export default NotificationsMenu;