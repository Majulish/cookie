import React, { useState } from 'react';
import { AppBar, Tabs, Tab, BottomNavigation, BottomNavigationAction, useTheme, useMediaQuery } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';

const ResponsiveTabs = () => {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <AppBar position="static" color="default">
      {isMobile ? (
        <BottomNavigation value={value} onChange={handleChange} showLabels>
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          <BottomNavigationAction label="Profile" icon={<AccountCircleIcon />} />
          <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
        </BottomNavigation>
      ) : (
        <Tabs value={value} onChange={handleChange} indicatorColor="primary" textColor="primary" centered>
          <Tab icon={<HomeIcon />} label="Home" />
          <Tab icon={<AccountCircleIcon />} label="Profile" />
          <Tab icon={<SettingsIcon />} label="Settings" />
        </Tabs>
      )}
    </AppBar>
  );
};

export default ResponsiveTabs;
