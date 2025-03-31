import React, { useState } from 'react';
import { 
  AppBar, 
  Tabs, 
  Tab, 
  BottomNavigation, 
  BottomNavigationAction, 
  useTheme, 
  useMediaQuery, 
  IconButton,
  Box,
  Toolbar,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  Fade
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import EventNoteIcon from '@mui/icons-material/EventNote';
import FeedIcon from '@mui/icons-material/Feed';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import CookieIcon from '@mui/icons-material/Cookie'; // For your brand logo
import useUserRole from '../pages/home/hooks/useUserRole';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from 'react-query';

interface ResponsiveTabsProps {
  value?: number;
  onChange?: (event: React.SyntheticEvent, newValue: number) => void;
}

const ResponsiveTabs: React.FC<ResponsiveTabsProps> = ({ value, onChange }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const userRole = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Define tab configuration
  const tabs = [
    { label: "Home", icon: <HomeIcon />, path: '/' },
    { label: "Schedule", icon: <EventNoteIcon />, path: '/calendar' },
    { label: "Feed", icon: <FeedIcon />, path: '/feed', role: 'worker' }
  ];
  
  // Filter tabs based on user role
  const visibleTabs = tabs.filter(tab => !tab.role || tab.role === userRole);
  
  // Determine the active tab based on the current path
  const getActiveTabFromPath = (): number => {
    const path = location.pathname;
    
    // If we're on event page or profile page, we don't want any tab to be selected
    if (path.startsWith('/event-page/') || path.startsWith('/profile/')) {
      return -1;
    }
    
    // For other paths, try to match
    for (let i = 0; i < visibleTabs.length; i++) {
      if (path === visibleTabs[i].path || 
          (visibleTabs[i].path !== '/' && path.startsWith(visibleTabs[i].path))) {
        return i;
      }
    }
    
    // If path is root or no match found
    if (path === '/') {
      return visibleTabs.findIndex(tab => tab.path === '/');
    }
    
    // If no match found at all
    return -1;
  };
  
  // Use the provided value or determine from path
  const activeTab = value !== undefined ? value : getActiveTabFromPath();
  
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    // Call the provided onChange if it exists
    if (onChange) {
      onChange(event, newValue);
    }
    
    // Always navigate to the tab path, even if it appears to be already selected
    if (visibleTabs[newValue]) {
      navigate(visibleTabs[newValue].path);
    }
  };

  const handleLogout = () => {
    queryClient.clear();
    navigate('/sign-in');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handler for profile navigation - now navigates to /profile/0
  const handleProfileClick = () => {
    navigate('/profile/0'); // Navigate to profile with ID 0 for current user
    handleMenuClose();
  };

  // Check if the user is a worker
  const isWorker = userRole === 'worker';

  return (
    <>
      {isMobile ? (
        <>
          {/* Mobile Header Bar */}
          <AppBar 
            position="fixed" 
            elevation={2}
            sx={{ 
              top: 0, 
              height: 56, 
              background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              color: theme.palette.primary.contrastText
            }}
          >
            <Toolbar>
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <CookieIcon 
                  sx={{ mr: 1.5, transform: 'scale(1.8)', color: theme.palette.primary.contrastText }} 
                />
                <Typography 
                  variant="h5" 
                  sx={{ fontWeight: 600, letterSpacing: 0.5, fontSize: '1.5rem', color: theme.palette.primary.contrastText }}
                >
                  Cookie
                </Typography>
              </Box>
              
              <IconButton 
                onClick={handleMenuOpen}
                size="small"
                sx={{ color: theme.palette.primary.contrastText }}
              >
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36,
                    bgcolor: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText
                  }}
                >
                  <PersonIcon fontSize="small" />
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                TransitionComponent={Fade}
                PaperProps={{
                  elevation: 3,
                  sx: { 
                    mt: 1.5,
                    minWidth: 150,
                    borderRadius: 1
                  }
                }}
              >
                {/* Show Profile option only for workers */}
                {isWorker && (
                  <MenuItem 
                    onClick={handleProfileClick}
                    sx={{ fontSize: '1.1rem' }}
                  >
                    Profile
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout} sx={{ fontSize: '1.1rem' }}>Logout</MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>
          
          {/* Bottom Navigation - INCREASED TEXT SIZE */}
          <BottomNavigation
            value={activeTab >= 0 ? activeTab : null}
            onChange={handleChange}
            showLabels
            sx={{ 
              position: 'fixed', 
              bottom: 0, 
              width: '100%', 
              zIndex: 1100,
              height: 64,
              borderTop: `1px solid rgba(0, 0, 0, 0.12)`,
              boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.05)',
              background: theme.palette.background.default
            }}
          >
            {visibleTabs.map((tab, index) => (
              <BottomNavigationAction 
                key={index} 
                label={tab.label} 
                icon={tab.icon} 
                sx={{
                  color: theme.palette.text.primary,
                  transition: 'all 0.2s ease-in-out',
                  '& .MuiBottomNavigationAction-label': {
                    fontSize: '1.05rem',  // Increased text size
                    fontWeight: 500,      // Slightly bolder
                    opacity: 1,           // Always visible
                    marginTop: '4px'      // More space for larger text
                  },
                  '& svg': {
                    fontSize: '1.8rem'    // Larger icons to match text
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    transform: 'translateY(-2px)',
                  },
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    '& .MuiBottomNavigationAction-label': {
                      fontSize: '1.1rem',  // Even larger when selected
                      fontWeight: 600      // Bolder when selected
                    },
                    '& svg': {
                      transform: 'scale(1.1)',
                      transition: 'transform 0.2s ease-in-out'
                    }
                  }
                }}
              />
            ))}
          </BottomNavigation>
        </>
      ) : (
        <AppBar 
          position="fixed" 
          elevation={2}
          sx={{ 
            top: 0, 
            width: '100%',
            background: `linear-gradient(90deg, #0a3880 0%, ${theme.palette.primary.dark} 100%)`,
            color: theme.palette.primary.contrastText
          }}
        >
          <Toolbar disableGutters sx={{ px: 2 }}>
            {/* Brand Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
              <CookieIcon 
                sx={{ mr: 1.5, transform: 'scale(1.8)', color: theme.palette.primary.contrastText }} 
              />
              <Typography 
                variant="h5" 
                sx={{ fontWeight: 600, letterSpacing: 0.5, fontSize: '1.5rem', color: theme.palette.primary.contrastText }}
              >
                Cookie
              </Typography>
            </Box>
            
            {/* Navigation Tabs - INCREASED TEXT SIZE */}
            <Box sx={{ flexGrow: 1 }}>
              <Tabs
                value={activeTab >= 0 ? activeTab : false}
                onChange={handleChange}
                textColor="inherit"
                indicatorColor="secondary"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    minWidth: 130,      // Increased to accommodate larger text
                    fontSize: '1.25rem', // Increased font size
                    opacity: 1,
                    color: theme.palette.primary.contrastText,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 0 8px rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-selected': {
                      fontWeight: 700,
                      fontSize: '1.3rem', // Slightly larger for selected tab
                      color: theme.palette.primary.contrastText,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 0 8px rgba(255, 255, 255, 0.2)',
                    },
                    borderRadius: '4px 4px 0 0',
                    mx: 0.5,
                    py: 1.5,     // More vertical padding for larger text
                    '& svg': {
                      fontSize: '1.6rem' // Larger icons to match text
                    }
                  }
                }}
              >
                {visibleTabs.map((tab, index) => (
                  <Tab 
                    key={index} 
                    icon={tab.icon} 
                    label={tab.label} 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'row', 
                      alignItems: 'center',
                      gap: 0.75,
                      '& svg': {
                        marginBottom: '0 !important',
                        marginRight: 0.5
                      }
                    }} 
                  />
                ))}
              </Tabs>
            </Box>
            
            {/* User Menu & Logout */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                onClick={handleMenuOpen}
                size="small"
                sx={{ 
                  ml: 2, 
                  color: theme.palette.primary.contrastText,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 40, 
                    height: 40,
                    bgcolor: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText,
                    '&:hover': { 
                      bgcolor: theme.palette.secondary.dark 
                    }
                  }}
                >
                  <PersonIcon />
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                TransitionComponent={Fade}
                PaperProps={{
                  elevation: 3,
                  sx: { 
                    mt: 1.5,
                    minWidth: 180,
                    borderRadius: 1
                  }
                }}
              >
                {/* Show Profile option only for workers */}
                {isWorker && (
                  <MenuItem 
                    onClick={handleProfileClick}
                    sx={{ fontSize: '1.2rem' }}
                  >
                    <PersonIcon fontSize="small" sx={{ mr: 1.5 }} />
                    Profile
                  </MenuItem>
                )}
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ fontSize: '1.2rem' }}
                >
                  <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
      )}
    </>
  );
};

export default ResponsiveTabs;