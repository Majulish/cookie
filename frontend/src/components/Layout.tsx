import React, { useState, ReactNode } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Drawer } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ResponsiveTabs from './ResponsiveTabs';
import SideTab from './SideTab';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent): void => {
    if (event.type === 'keydown') {
      return;
    }
    setDrawerOpen(open);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', marginRight: '12px' }}>
            Cookie
          </Typography>
          <ResponsiveTabs />
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={isDrawerOpen} onClose={toggleDrawer(false)}>
        <SideTab />
      </Drawer>
      <main>{children}</main>
    </>
  );
};

export default Layout;
