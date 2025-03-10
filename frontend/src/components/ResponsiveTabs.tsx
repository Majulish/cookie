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

interface ResponsiveTabsProps {
  value?: number;
  onChange?: (event: React.SyntheticEvent, newValue: number) => void;
}

const ResponsiveTabs: React.FC<ResponsiveTabsProps> = ({ value, onChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const userRole = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Define tab configuration
  const tabs = [
    { label: "Home", icon: <HomeIcon />, path: '/' },
    { label: "Schedule", icon: <EventNoteIcon />, path: '/schedule' },
    { label: "Feed", icon: <FeedIcon />, path: '/feed', role: 'worker' }
    // Profile removed as it's accessible from the avatar menu
  ];
  
  // Filter tabs based on user role
  const visibleTabs = tabs.filter(tab => !tab.role || tab.role === userRole);
  
  // Determine the active tab based on the current path
  const getActiveTabFromPath = (): number => {
    const path = location.pathname;
    const index = visibleTabs.findIndex(tab => tab.path === path);
    return index >= 0 ? index : 0; // Default to home if path not found
  };
  
  // Use the provided value or determine from path
  const activeTab = value !== undefined ? value : getActiveTabFromPath();
  
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    // Call the provided onChange if it exists
    if (onChange) {
      onChange(event, newValue);
    }
    
    // Navigate to the corresponding path
    if (visibleTabs[newValue]) {
      navigate(visibleTabs[newValue].path);
    }
  };

  const handleLogout = () => {
    navigate('/sign-in');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
                  sx={{ mr: 1.5, transform: 'scale(1.5)', color: theme.palette.primary.contrastText }} 
                />
                <Typography 
                  variant="h5" 
                  sx={{ fontWeight: 600, letterSpacing: 0.5, color: theme.palette.primary.contrastText }}
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
                <MenuItem onClick={() => { 
                  navigate('/profile'); 
                  handleMenuClose();
                }}>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>
          
          {/* Bottom Navigation */}
          <BottomNavigation
            value={activeTab}
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
                  color: theme.palette.text.secondary,
                  // When active, make the text and icon more prominent
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
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
                sx={{ mr: 1.5, transform: 'scale(1.5)', color: theme.palette.primary.contrastText }} 
              />
              <Typography 
                variant="h5" 
                sx={{ fontWeight: 600, letterSpacing: 0.5, color: theme.palette.primary.contrastText }}
              >
                Cookie
              </Typography>
            </Box>
            
            {/* Navigation Tabs */}
            <Box sx={{ flexGrow: 1 }}>
              <Tabs
                value={activeTab}
                onChange={handleChange}
                textColor="inherit"
                indicatorColor="secondary"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none', 
                    fontWeight: 600,
                    minWidth: 120,
                    fontSize: '1.05rem',
                    color: theme.palette.primary.contrastText,
                    '&.Mui-selected': {
                      fontWeight: 700,
                      color: theme.palette.primary.contrastText,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)'
                    },
                    borderRadius: '4px 4px 0 0',
                    mx: 0.5
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
                sx={{ ml: 2, color: theme.palette.primary.contrastText }}
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
                <MenuItem onClick={() => { 
                  navigate('/profile'); 
                  handleMenuClose();
                }}>
                  <PersonIcon fontSize="small" sx={{ mr: 1.5 }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
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