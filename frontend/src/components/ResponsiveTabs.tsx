import React from 'react';
import { AppBar, Tabs, Tab, BottomNavigation, BottomNavigationAction, useTheme, useMediaQuery } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ChatIcon from '@mui/icons-material/Chat';
import CreateIcon from '@mui/icons-material/Create';
import DataArrayIcon from '@mui/icons-material/DataArray';

interface ResponsiveTabsProps {
  value?: number;
  onChange?: (event: React.SyntheticEvent, newValue: number) => void;
}

const ResponsiveTabs: React.FC<ResponsiveTabsProps> = ({ value = 0, onChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (onChange) {
      onChange(event, newValue);
    }
  };

  return (
    <>
      {isMobile ? (
        <BottomNavigation
          value={value}
          onChange={handleChange}
          showLabels
          style={{ position: 'fixed', bottom: 0, width: '100%', zIndex: 1100 }}
        >
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          <BottomNavigationAction label="Schedule" icon={<EventNoteIcon />} />
          <BottomNavigationAction label="Chat" icon={<ChatIcon />} />
          <BottomNavigationAction label="Create" icon={<CreateIcon />} />
          <BottomNavigationAction label="Data" icon={<DataArrayIcon />} />
        </BottomNavigation>
      ) : (
        <AppBar position="fixed" color="default" style={{ top: 0, width: '100%' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab icon={<HomeIcon />} label="Home" />
            <Tab icon={<EventNoteIcon />} label="Schedule" />
            <Tab icon={<ChatIcon />} label="Chat" />
            <Tab icon={<CreateIcon />} label="Create" />
            <Tab icon={<DataArrayIcon />} label="Data" />
          </Tabs>
        </AppBar>
      )}
    </>
  );
};

export default ResponsiveTabs;