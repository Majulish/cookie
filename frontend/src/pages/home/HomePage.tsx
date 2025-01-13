import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, IconButton, Button, Box } from '@mui/material';
import { useQuery, useQueryClient } from 'react-query';
import ResponsiveTabs from '../../components/ResponsiveTabs';
import SideTab from '../../components/SideTab';
import NewEventModal from './create_event/NewEventModal';
import { EventFormInputs, convertFormDataToAPIPayload } from './create_event/eventScheme';
import { createEvent, getMyEvents, getEventsFeed, editEvent, deleteEvent } from '../../api/eventApi';
import NotificationsIcon from '@mui/icons-material/Notifications';
import useUserRole from './hooks/useUserRole';
import FeedList from './feed/FeedList';
import MyEventList from './my_events/MyEventList';
import LoadingPage from './LoadingPage';
import ErrorPage from './ErrorPage';
import EventFilters from './feed/EventFilters';
import axios from 'axios';

const HomePage: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const queryClient = useQueryClient();
    const { data: events = [], isLoading, isError } = useQuery(['events'], getMyEvents);
    const userRole = useUserRole();
    const { data: feedEvents = [] } = useQuery(
        ['eventsFeed'], 
        getEventsFeed,
        { enabled: userRole === 'worker' }
    );
    const [filteredEvents, setFilteredEvents] = useState(feedEvents);

    useEffect(() => {
        setFilteredEvents(feedEvents);
    }, [feedEvents]);

    const handleOpen = () => setModalOpen(true);
    const handleClose = () => setModalOpen(false);

    const handleFilterChange = (location: string, jobTitle: string) => {
        let filtered = [...feedEvents];
        
        if (location) {
            filtered = filtered.filter(event => event.location === location);
        }
        
        if (jobTitle) {
            filtered = filtered.filter(event => 
                event.jobs.some(job => job.job_title === jobTitle)
            );
        }
        
        setFilteredEvents(filtered);
    };

    const handleEventSubmit = async (data: EventFormInputs): Promise<boolean> => {
        try {
            const apiPayload = convertFormDataToAPIPayload(data);
            await createEvent(apiPayload);
            await queryClient.invalidateQueries(['events']);
            setModalOpen(false);
            return true; 
        } catch (error) {
            console.error("Failed to create event:", error);
            alert('Failed to create event. Please try again.');
            return false; 
        }
    };

    const handleEventUpdate = async (eventId: number, data: EventFormInputs) => {
        try {
            console.log('Raw form data received:', data);
            console.log('Event ID:', eventId);
            
            const apiPayload = convertFormDataToAPIPayload(data);
            console.log('Converted API payload:', apiPayload);
            
            const result = await editEvent(eventId, apiPayload);
            console.log('API response:', result);
            
            await queryClient.invalidateQueries(['events']);
            setModalOpen(false);
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error Response Data:', error.response?.data);
                console.error('Error Status:', error.response?.status);
                console.error('Error Headers:', error.response?.headers);
            }
            console.error("Failed to edit event: ", error);
            alert('Failed to edit event. Please try again.');
            return false;
        }
    };

    const handleEventDelete = async (eventId: number): Promise<boolean> => {
        try {
            await deleteEvent(eventId);
            await queryClient.invalidateQueries(['events']);
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error Response Data:', error.response?.data);
                console.error('Error Status:', error.response?.status);
            }
            console.error("Failed to delete event: ", error);
            alert('Failed to delete event. Please try again.');
            return false;
        }
    };

    const renderWorkerView = () => (
        <Grid container spacing={8} justifyContent="space-between">
            <Grid item xs={5}>
                <Box sx={{ position: 'sticky', top: '84px' }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Upcoming Events
                    </Typography>
                    <Box sx={{ mt: 8, maxHeight: '70vh', overflowY: 'auto', pr: 2 }}>
                        {events.length === 0 ? (
                            <Typography variant="body1" color="textSecondary">
                                No events yet
                            </Typography>
                        ) : (
                            <MyEventList 
                                events={events}
                                onEventUpdate={handleEventUpdate}
                                onEventDelete={handleEventDelete}
                            />
                        )}
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={5}>
                <Box sx={{ position: 'sticky', top: '84px' }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Sign Up For Events
                    </Typography>
                    <Box sx={{ mt: 6 }}>
                        <EventFilters 
                            events={feedEvents} 
                            onFilterChange={handleFilterChange}
                        />
                        <Box sx={{ mt: 4, maxHeight: '70vh', overflowY: 'auto', pr: 2 }}>
                            {filteredEvents.length === 0 ? (
                                <Typography variant="body1" color="textSecondary">
                                    No events match your filters
                                </Typography>
                            ) : (
                                <FeedList events={filteredEvents} />
                            )}
                        </Box>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );

    const renderRecruiterView = () => (
        <Grid container spacing={4}>
            <Grid item xs={8}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Upcoming Events
                </Typography>
                <Box mt={8}>
                    {events.length === 0 ? (
                        <Typography variant="body1" color="textSecondary">
                            No events yet
                        </Typography>
                    ) : (
                        <MyEventList 
                            events={events} 
                            onEventUpdate={handleEventUpdate}
                            onEventDelete={handleEventDelete}
                        />
                    )}
                </Box>
                <Box mt={4}>
                    <FeedList events={feedEvents} />
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleOpen}
                    sx={{ mt: 2 }}
                >
                    Create Event
                </Button>
            </Grid>
            <Grid item xs={4}>
                <SideTab />
            </Grid>
        </Grid>
    );

    if (isLoading) {
        return <LoadingPage />;
    }

    // if (isError) {
    //     return <ErrorPage />
    // }

    return (
        <Container maxWidth="xl" sx={{ pt: 8, pb: 0, minHeight: '100vh' }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <ResponsiveTabs />
                </Grid>
                <Grid item xs={12} sx={{ mt: 3 }}>
                    {userRole === 'worker' ? renderWorkerView() : renderRecruiterView()}
                </Grid>
            </Grid>

            <IconButton
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
                <NotificationsIcon />
            </IconButton>

            <NewEventModal 
                open={modalOpen} 
                onClose={handleClose} 
                onSubmit={handleEventSubmit} 
                mode="create"
            />
        </Container>
    );
};

export default HomePage;