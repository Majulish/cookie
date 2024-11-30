import React, { useState } from 'react';
import { Container, Typography, Grid, IconButton, Button, Box } from '@mui/material';
import { useQuery, useQueryClient } from 'react-query';
import ResponsiveTabs from '../../components/ResponsiveTabs';
import SideTab from '../../components/SideTab';
import NewEventModal from './crate_event/NewEventModal';
import { EventFormInputs, convertFormDataToAPIPayload } from './crate_event/eventScheme';
import { createEvent, getMyEvents, getEventsFeed } from '../../api/eventApi';
import NotificationsIcon from '@mui/icons-material/Notifications';
import useUserRole from './hooks/useUserRole';
import FeedList from './feed/FeedList';
import MyEventList from './my_events/MyEventList';
import LoadingPage from './LoadingPage';
import ErrorPage from './ErrorPage'


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

    const handleOpen = () => setModalOpen(true);
    const handleClose = () => setModalOpen(false);

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
                            <MyEventList events={events} />
                        )}
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={5}>
                <Box sx={{ position: 'sticky', top: '84px' }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Sign Up For Events
                    </Typography>
                    <Box sx={{ mt: 8, maxHeight: '70vh', overflowY: 'auto', pr: 2 }}>
                        {feedEvents.length === 0 ? (
                            <Typography variant="body1" color="textSecondary">
                                No events yet
                            </Typography>
                        ) : (
                            <FeedList events={feedEvents} />
                        )}
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
                        <MyEventList events={events} />
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

    if(isLoading){
        return <LoadingPage/>;
    }

    

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
            />
        </Container>
    );
};

export default HomePage;