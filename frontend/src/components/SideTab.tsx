import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { AccountCircle, Settings, Help, ExitToApp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

const SideTab: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === 'keydown' && (event as React.KeyboardEvent).key === 'Tab') {
      return;
    }
    setIsOpen(open);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <IconButton
        onClick={toggleDrawer(true)}
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 1200,
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer anchor="right" open={isOpen} onClose={toggleDrawer(false)}>
        <List>
          <ListItem button onClick={() => handleNavigation('/profile')}>
            <ListItemIcon><AccountCircle /></ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
          <ListItem button onClick={() => handleNavigation('/settings')}>
            <ListItemIcon><Settings /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
          <ListItem button onClick={() => handleNavigation('/support')}>
            <ListItemIcon><Help /></ListItemIcon>
            <ListItemText primary="Support" />
          </ListItem>
          <ListItem button onClick={() => handleNavigation('/logout')}>
            <ListItemIcon><ExitToApp /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default SideTab;
