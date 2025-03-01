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
import { getUserNotifications } from '../api/notificationsApi';
import { useQuery, useQueryClient } from 'react-query';

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
  onClick: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ message, created_at, is_read, onClick }) => (
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
      secondary={new Date(created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}
      primaryTypographyProps={{
        sx: { fontWeight: is_read ? 'normal' : 'bold' }
      }}
    />
  </ListItem>
);

const NotificationsMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const queryClient = useQueryClient();
  
  // Only fetch notifications when the popover is open to prevent excessive API calls
  const open = Boolean(anchorEl);
  
  const { 
    data: notifications = [], 
    isLoading, 
    isError 
  } = useQuery(
    'notifications', 
    getUserNotifications,
    {
      // Only fetch when popover is open
      enabled: open,
      // Reduce refetch frequency
      staleTime: 300000, // 5 minutes
      refetchOnWindowFocus: false
    }
  );

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    // Manually refetch notifications when opening the menu
    if (!open) {
      queryClient.invalidateQueries('notifications');
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notificationId: number) => {
    // For now, this just logs the notification ID
    console.log(`Clicked on notification ${notificationId}`);
    
    // You could add functionality here like:
    // - Mark notification as read
    // - Navigate to related event or page
    // - Open related modal or detailed view
  };

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
        <StyledBadge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </StyledBadge>
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

        {isLoading ? (
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
                onClick={() => handleNotificationClick(notification.id)}
              />
            ))}
          </List>
        )}
      </Popover>
    </>
  );
};

export default NotificationsMenu;