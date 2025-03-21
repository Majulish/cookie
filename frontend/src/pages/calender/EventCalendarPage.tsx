import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Breadcrumbs,
  Link,
  useTheme
} from '@mui/material';
import { 
  CalendarMonth as CalendarIcon,
  Home as HomeIcon,
  Event as EventIcon
} from '@mui/icons-material';
import Calendar from './Calendar';
import EventDetailsModal from './EventDetailsModal';
import ResponsiveTabs from '../../components/ResponsiveTabs'; 
import { MyEventScheme } from '../home/create_event/eventScheme';

const EventsCalendarPage: React.FC = () => {
  const theme = useTheme();
  const [selectedEvent, setSelectedEvent] = useState<MyEventScheme | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(1); 

  // Update document title on component mount
  useEffect(() => {
    document.title = "Event Calendar | My Events";
    return () => {
      // Optional: Reset title when component unmounts
    };
  }, []);

  // Handle event click from calendar
  const handleEventClick = (event: MyEventScheme) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  // Close event details modal
  const handleCloseModal = () => {
    setDialogOpen(false);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <>
      {/* Add ResponsiveTabs at the top */}
      <ResponsiveTabs value={activeTab} onChange={handleTabChange} />
      
      {/* Add top padding to account for the navigation bar */}
      <Box sx={{ 
        pt: { xs: 8, sm: 9 }, // Add padding-top to account for the navigation bar
        pb: 2,
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Breadcrumbs navigation */}
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link 
              color="inherit" 
              href="/" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                '&:hover': { color: theme.palette.primary.main }
              }}
            >
              <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
              Home
            </Link>
            <Typography 
              color="text.primary"
              sx={{ 
                display: 'flex', 
                alignItems: 'center'
              }}
            >
              <CalendarIcon sx={{ mr: 0.5, fontSize: 18 }} />
              Calendar
            </Typography>
          </Breadcrumbs>

          {/* Page Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
            mb: 4
          }}>
            <Box>
              <Typography variant="h3" component="h1" gutterBottom>
                Event Calendar
              </Typography>
              <Typography variant="body1" color="text.secondary">
                View and manage all your scheduled events in calendar format
              </Typography>
            </Box>
          </Box>

          {/* Main Calendar Container */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
              mb: 4
            }}
          >
            <Calendar onEventClick={handleEventClick} />
          </Paper>
          
          {/* Additional Information Section */}
          <Box sx={{ mt: 4, mb: { xs: 9, sm: 4 } }}> {/* Add bottom margin on mobile to account for bottom navigation */}
            <Typography variant="h5" gutterBottom>
              Upcoming Events
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click on any event in the calendar to view details about your events.
            </Typography>
          </Box>
        </Container>
      </Box>
      
      {/* Event Details Modal */}
      <EventDetailsModal 
        event={selectedEvent} 
        open={dialogOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
};

export default EventsCalendarPage;