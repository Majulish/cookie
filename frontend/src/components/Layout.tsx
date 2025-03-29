import React from 'react';
import { 
  Box, 
  Container,
  Paper
} from '@mui/material';
import ResponsiveTabs from './ResponsiveTabs';
import NotificationsMenu from './NotificationsMenu';

interface LayoutProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  maxWidth = 'xl' 
}) => {
  return (
    <Box 
      sx={{ 
        bgcolor: 'background.default',
        minHeight: '100vh',
        pb: 8 
      }}
    >
      <Container maxWidth={maxWidth} sx={{ pt: 3, pb: 6 }}>
        {/* Navigation bar */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 2,
            mb: 3,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <ResponsiveTabs value={0} />
        </Paper>
        
        {/* Page content */}
        {children}
        
        {/* Notifications menu */}
        <NotificationsMenu />
      </Container>
    </Box>
  );
};

export default Layout;