import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Button, 
  Box, 
  Paper, 
  Divider, 
  useTheme, 
  useMediaQuery, 
  Fab,
  Tooltip,
  Fade,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useQuery, useQueryClient } from 'react-query';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FeedIcon from '@mui/icons-material/Feed';
import ResponsiveTabs from '../../components/ResponsiveTabs';
import NewEventModal from './create_event/NewEventModal';
import { EventFormInputs, convertFormDataToAPIPayload } from './create_event/eventScheme';
import { createEvent, getMyEvents, getEventsFeed, editEvent, deleteEvent } from '../../api/eventApi';
import useUserRole from './hooks/useUserRole';
import FeedList from './feed/FeedList';
import MyEventList from './my_events/MyEventList';
import LoadingPage from './LoadingPage';
import axios from 'axios';
import NotificationsMenu from '../../components/NotificationsMenu';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    
    const queryClient = useQueryClient();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
    
    const { data: events = [], isLoading, isError } = useQuery(['events'], getMyEvents);
    const userRole = useUserRole();
    // Only fetch feed events for recruiter view
    const { data: feedEvents = [] } = useQuery(
        ['eventsFeed'], 
        getEventsFeed,
        { enabled: userRole !== 'worker' }
    );

    const handleOpen = () => setModalOpen(true);
    const handleClose = () => setModalOpen(false);
    
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const showNotification = (message: string, severity: 'success' | 'error') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleEventSubmit = async (data: EventFormInputs): Promise<boolean> => {
        try {
            const apiPayload = convertFormDataToAPIPayload(data);
            await createEvent(apiPayload);
            await queryClient.invalidateQueries(['events']);
            setModalOpen(false);
            showNotification('Event created successfully!', 'success');
            return true; 
        } catch (error) {
            console.error("Failed to create event:", error);
            showNotification('Failed to create event. Please try again.', 'error');
            return false; 
        }
    };

    const handleEventUpdate = async (eventId: number, data: EventFormInputs) => {
        try {
            const apiPayload = convertFormDataToAPIPayload(data);
            await editEvent(eventId, apiPayload);
            await queryClient.invalidateQueries(['events']);
            showNotification('Event updated successfully!', 'success');
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error Response Data:', error.response?.data);
                console.error('Error Status:', error.response?.status);
            }
            console.error("Failed to edit event: ", error);
            showNotification('Failed to update event. Please try again.', 'error');
            return false;
        }
    };

    const handleEventDelete = async (eventId: number): Promise<boolean> => {
        try {
            await deleteEvent(eventId);
            await queryClient.invalidateQueries(['events']);
            showNotification('Event deleted successfully!', 'success');
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error Response Data:', error.response?.data);
                console.error('Error Status:', error.response?.status);
            }
            console.error("Failed to delete event: ", error);
            showNotification('Failed to delete event. Please try again.', 'error');
            return false;
        }
    };

    const renderWorkerView = () => (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        height: '100%',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Box>
                        <Box 
                            sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                mb: 3,
                                justifyContent: 'space-between'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarTodayIcon 
                                    sx={{ 
                                        color: 'primary.main',
                                        mr: 1.5,
                                        fontSize: '2.2rem'  // Increased from 1.75rem
                                    }} 
                                />
                                <Typography 
                                    variant="h5" 
                                    component="h1" 
                                    sx={{ 
                                        fontWeight: 600,
                                        color: 'text.primary',
                                        fontSize: '2rem'  // Increased from default h5
                                    }}
                                >
                                    My Events
                                </Typography>
                            </Box>
                            <Button
                                component={Link}
                                to="/feed"
                                variant="outlined"
                                color="primary"
                                startIcon={<FeedIcon />}
                                sx={{ 
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontSize: '1.1rem',  // Increased font size
                                    padding: '8px 16px'  // Added more padding
                                }}
                            >
                                Browse Events
                            </Button>
                        </Box>
                        
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress size={28} color="primary" />
                            </Box>
                        ) : events.length === 0 ? (
                            <Box 
                                sx={{ 
                                    p: 3, 
                                    textAlign: 'center',
                                    bgcolor: 'action.hover',
                                    borderRadius: 2
                                }}
                            >
                                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.2rem' }}>
                                    You don't have any events yet
                                </Typography>
                                <Button
                                    component={Link}
                                    to="/feed"
                                    variant="contained"
                                    color="primary"
                                    sx={{ 
                                        mt: 2,
                                        fontSize: '1.1rem',  // Increased font size
                                        padding: '8px 20px'  // Increased padding
                                    }}
                                >
                                    Find Events
                                </Button>
                            </Box>
                        ) : (
                            <MyEventList 
                                events={events}
                                onEventUpdate={handleEventUpdate}
                                onEventDelete={handleEventDelete}
                            />
                        )}
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );

    const renderRecruiterView = () => (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        height: '100%',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box 
                            sx={{ 
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <EventIcon 
                                sx={{ 
                                    color: 'primary.main',
                                    mr: 1.5,
                                    fontSize: '2.2rem'  // Increased from 1.75rem
                                }} 
                            />
                            <Typography 
                                variant="h5" 
                                component="h1" 
                                sx={{ 
                                    fontWeight: 600,
                                    fontSize: '2rem'  // Increased from default h5
                                }}
                            >
                                Event Management
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"  // Changed from medium to large
                            startIcon={<AddIcon sx={{ fontSize: '1.5rem' }} />}
                            onClick={handleOpen}
                            sx={{ 
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '1.2rem',  // Increased font size
                                padding: '10px 24px',  // Increased padding
                                boxShadow: 2
                            }}
                        >
                            Create Event
                        </Button>
                    </Box>
                    
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={32} color="primary" />
                        </Box>
                    ) : events.length === 0 ? (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                borderRadius: 2,
                                bgcolor: 'grey.50',
                                border: '1px dashed',
                                borderColor: 'grey.300',
                                mb: 4
                            }}
                        >
                            <Typography variant="h6" gutterBottom color="text.secondary" sx={{ fontSize: '1.3rem' }}>
                                No Events Created Yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph sx={{ fontSize: '1.1rem' }}>
                                Start by creating your first event using the "Create Event" button above.
                            </Typography>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleOpen}
                                sx={{ 
                                    mt: 1,
                                    fontSize: '1.1rem',
                                    padding: '8px 20px'
                                }}
                            >
                                Create Your First Event
                            </Button>
                        </Paper>
                    ) : (
                        <Box>
                            <MyEventList 
                                events={events} 
                                onEventUpdate={handleEventUpdate}
                                onEventDelete={handleEventDelete}
                            />
                        </Box>
                    )}
                    
                    {feedEvents.length > 0 && (
                        <Box mt={6}>
                            <Divider sx={{ mb: 4 }} />
                            <Box 
                                sx={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 3
                                }}
                            >
                                <FeedIcon 
                                    sx={{ 
                                        color: 'primary.main',
                                        mr: 1.5,
                                        fontSize: '2.2rem'  // Increased from 1.75rem
                                    }} 
                                />
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        fontWeight: 600,
                                        fontSize: '2rem'  // Increased from default h5
                                    }}
                                >
                                    All Events
                                </Typography>
                            </Box>
                            <FeedList events={feedEvents} />
                        </Box>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );

    if (isLoading) {
        return <LoadingPage />;
    }
    
    return (
        <Box 
            sx={{ 
                bgcolor: 'background.default',
                minHeight: '100vh',
                pb: 8 
            }}
        >
            <Container maxWidth="xl" sx={{ pt: 3, pb: 6 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
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
                    </Grid>
                    <Grid item xs={12}>
                        {userRole === 'worker' ? renderWorkerView() : renderRecruiterView()}
                    </Grid>
                </Grid>

                {/* Floating action button for creating events (only for non-workers) */}
                {userRole !== 'worker' && isMobile && (
                    <Tooltip title="Create Event" placement="left" TransitionComponent={Fade}>
                        <Fab
                            color="primary"
                            aria-label="create event"
                            onClick={handleOpen}
                            sx={{
                                position: 'fixed',
                                bottom: 24,
                                right: 24,
                                boxShadow: 3,
                                width: '64px',  // Increased size
                                height: '64px'  // Increased size
                            }}
                        >
                            <AddIcon sx={{ fontSize: '2rem' }} />
                        </Fab>
                    </Tooltip>
                )}

                <NotificationsMenu />

                <NewEventModal 
                    open={modalOpen} 
                    onClose={handleClose} 
                    onSubmit={handleEventSubmit} 
                    mode="create"
                />
                
                <Snackbar 
                    open={snackbarOpen} 
                    autoHideDuration={6000} 
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert 
                        onClose={handleSnackbarClose} 
                        severity={snackbarSeverity}
                        variant="filled"
                        sx={{ width: '100%', fontSize: '1.1rem' }}
                    >
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};

export default HomePage;