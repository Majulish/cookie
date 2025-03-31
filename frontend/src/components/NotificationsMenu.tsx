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
  useTheme,
  AlertColor
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import EventIcon from '@mui/icons-material/Event';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import MarkAsReadIcon from '@mui/icons-material/CheckCircle';

import { 
  getUserNotifications, 
  markNotificationsAsRead, 
  approveNotification, 
  handleNotificationDismissal, 
  Notification 
} from '../api/notificationsApi';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import NotificationApprovalDialog from './NotificationApprovalDialog';
import FeedbackSnackbar from './FeedbackSnackbar';
import useUserRole from '../pages/home/hooks/useUserRole';

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
  onMarkAsRead: (id: string) => void;
  isClickable: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick, onMarkAsRead, isClickable }) => {
  const theme = useTheme();
  const { id, message, created_at, is_read, event_id } = notification;
  
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

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(id.toString());
  };

  return (
    <ListItem 
      onClick={isClickable ? onClick : undefined}
      sx={{ 
        px: 2,
        py: 1.5,
        bgcolor: is_read ? 'transparent' : alpha(theme.palette.primary.light, 0.08),
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: isClickable ? alpha(theme.palette.primary.light, 0.12) : is_read ? 'transparent' : alpha(theme.palette.primary.light, 0.08),
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
              fontSize: '1.05rem',
              color: is_read ? 'text.primary' : 'text.primary'
            }}
          >
            {message}
          </Typography>
        }
        secondary={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {formattedDate} • {formattedTime}
            </Typography>
            
            {event_id && isClickable && (
              <Button 
                size="small" 
                variant="text" 
                color="primary"
                sx={{ 
                  minWidth: 'auto', 
                  p: '2px 4px',
                  fontSize: '0.85rem',
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
      
      {!is_read && (
        <Tooltip title="Mark as read" placement="left">
          <IconButton 
            size="medium" 
            onClick={handleMarkAsRead}
            sx={{ 
              ml: 1,
              color: 'text.secondary',
              '&:hover': { 
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            <MarkAsReadIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
      )}
    </ListItem>
  );
};

const NOTIFICATION_REFETCH_INTERVAL = 60000; // 1 minute

const NotificationsMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [pendingApprovalNotification, setPendingApprovalNotification] = useState<Notification | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSeverity, setFeedbackSeverity] = useState<AlertColor>('success');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Get the user's role
  const userRole = useUserRole();
  
  // Check if the user is a worker
  const isWorker = userRole === 'worker';
  
  // Determine if notifications are clickable based on role
  const notificationsClickable = !isWorker;
  
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

  // Check for unapproved notifications when notifications are fetched
  useEffect(() => {
    const unapprovedNotification = notifications.find(notif => notif.is_approved === false);
    if (unapprovedNotification && !dialogOpen) {
      setPendingApprovalNotification(unapprovedNotification);
      setDialogOpen(true);
    }
  }, [notifications, dialogOpen]);

  const unreadCount = notifications.filter(notif => !notif.is_read && notif.is_approved).length;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    // Refresh notifications when opening the menu
    refetch();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setPendingApprovalNotification(null);
  };

  const handleApproveNotification = (notificationId: number) => {
    // Find the notification to get its event_id
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) {
      console.error(`Notification with ID ${notificationId} not found`);
      return;
    }
    
    approveNotification(notificationId, notification.event_id)
      .then(() => {
        console.log(`Approved notification ${notificationId} with event ID ${notification.event_id}`);
        // Show success feedback
        setFeedbackMessage('You have successfully approved your attendance!');
        setFeedbackSeverity('success');
        setFeedbackOpen(true);
        
        // Refresh notifications data
        refetch();
        
        // Check for any other pending notifications
        setTimeout(() => {
          const remainingUnapproved = notifications.filter(
            notif => notif.is_approved === false && notif.id !== notificationId
          );
          
          if (remainingUnapproved.length > 0) {
            setPendingApprovalNotification(remainingUnapproved[0]);
            setDialogOpen(true);
          }
        }, 500);
      })
      .catch(error => {
        console.error('Failed to approve notification:', error);
        // Show error feedback
        setFeedbackMessage('Failed to approve your attendance. Please try again.');
        setFeedbackSeverity('error');
        setFeedbackOpen(true);
      });
  };

  const handleDenyNotification = (notificationId: number) => {
    // Simply decline the notification without making an API call
    handleNotificationDismissal(notificationId)
      .then(() => {
        console.log(`Declined notification ${notificationId}`);
        
        // Show feedback message
        setFeedbackMessage('You have declined your attendance. HR has been notified.');
        setFeedbackSeverity('info');
        setFeedbackOpen(true);
        
        // Refresh notifications data
        refetch();
        
        // Check for any other pending notifications
        setTimeout(() => {
          const remainingUnapproved = notifications.filter(
            notif => notif.is_approved === false && notif.id !== notificationId
          );
          
          if (remainingUnapproved.length > 0) {
            setPendingApprovalNotification(remainingUnapproved[0]);
            setDialogOpen(true);
          }
        }, 500);
      });
  };

  const handleNotificationClick = (notification: Notification) => {
    // If the user is a worker, don't do anything
    if (isWorker) {
      return;
    }
    
    // Navigate to event page if notification has an event_id
    if (notification.event_id) {
      navigate(`/event-page/${notification.event_id}`);
      handleClose(); // Close the notification menu after navigating
    } else {
      console.log('This notification has no associated event');
    }
  };

  const handleMarkAllAsRead = () => {
    // Get all unread notification IDs
    const unreadNotificationIds = notifications
      .filter(notification => !notification.is_read && notification.is_approved)
      .map(notification => notification.id);
    
    if (unreadNotificationIds.length === 0) {
      return; // No unread notifications to mark
    }
    
    markNotificationsAsRead(unreadNotificationIds)
      .then(() => {
        // Invalidate and refetch notifications to update the UI
        queryClient.invalidateQueries('notifications');
        console.log(`Marked ${unreadNotificationIds.length} notifications as read`);
      })
      .catch(error => {
        console.error('Failed to mark all notifications as read:', error);
      });
  };

  const handleMarkSingleAsRead = (notificationId: string) => {
    // Convert string ID to number since the API expects number[]
    const id = parseInt(notificationId, 10);
    
    if (isNaN(id)) {
      console.error('Invalid notification ID:', notificationId);
      return;
    }
    
    markNotificationsAsRead([id])
      .then(() => {
        // Invalidate and refetch notifications to update the UI
        queryClient.invalidateQueries('notifications');
        console.log(`Marked notification ${id} as read`);
      })
      .catch(error => {
        console.error('Failed to mark notification as read:', error);
      });
  };

  // Filter out unapproved notifications from the list
  const approvedNotifications = notifications.filter(notif => notif.is_approved);

  const handleFeedbackClose = () => {
    setFeedbackOpen(false);
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
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.3rem' }}>
              Notifications
              {unreadCount > 0 && (
                <Typography 
                  component="span" 
                  variant="body2" 
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
        ) : approvedNotifications.length === 0 ? (
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
                {approvedNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onMarkAsRead={handleMarkSingleAsRead}
                    isClickable={notificationsClickable}
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
                  size="medium"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleMarkAllAsRead}
                  sx={{ fontWeight: 500, fontSize: '0.95rem' }}
                >
                  Mark all as read
                </Button>
              </Box>
            )}
          </>
        )}
      </Popover>

      {/* Notification Approval Dialog - Only shown for non-worker roles */}
      {!isWorker && (
        <NotificationApprovalDialog
          notification={pendingApprovalNotification}
          open={dialogOpen}
          onClose={handleDialogClose}
          onApprove={handleApproveNotification}
          onDeny={handleDenyNotification}
        />
      )}

      {/* Feedback Snackbar */}
      <FeedbackSnackbar
        open={feedbackOpen}
        message={feedbackMessage}
        severity={feedbackSeverity}
        onClose={handleFeedbackClose}
      />
    </>
  );
};

export default NotificationsMenu;