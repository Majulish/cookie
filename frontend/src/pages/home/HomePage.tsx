import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, IconButton, Button } from '@mui/material';
import { useQuery, useQueryClient } from 'react-query';
import ResponsiveTabs from '../../components/ResponsiveTabs';
import SideTab from '../../components/SideTab';
import NewEventModal from './crate_event/NewEventModal';
import { EventFormInputs } from './crate_event/eventScheme';
import { createEvent, getEvents } from '../../api/eventApi';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventList from '../home/crate_event/EventList';
import LoadingPage from './LoadingPage';  
import { useNavigate } from 'react-router-dom';
import useUserRole from './hooks/useUserRole';

const HomePage: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: events = [], isLoading, isError } = useQuery(['events'], getEvents);
    const userRole = useUserRole(); 


    const handleOpen = () => setModalOpen(true);
    const handleClose = () => setModalOpen(false);

    const handleEventSubmit = async (data: EventFormInputs) => {
        try {
            await createEvent(data);
            await queryClient.invalidateQueries(['events']);
            setModalOpen(false);
        } catch (error) {
            console.error("Failed to create event:", error);
        }
    };

    // if (isLoading) {
    //     return <LoadingPage />;
    // }
    // if(isError){
    //     navigate('/error');
    // }

    return (
        <Container style={{ paddingTop: '64px', paddingBottom: '0px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <ResponsiveTabs />
                </Grid>

                <Grid item xs={12} md={8} style={{ marginTop: '24px' }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Upcoming Events
                    </Typography>

                    {events.length === 0 ? (
                        <Typography variant="body1" color="textSecondary" style={{ marginTop: '16px' }}>
                            No events yet
                        </Typography>
                    ) : (
                        <EventList events={events} />
                    )}

                    {/* !!!!!!!!!!!! CHANGE LATER TO && !!!!!!!!!!!!!!!!!!!! */}

                    {((userRole === 'recruiter') || (userRole === 'hr_manager')) || ( 
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={handleOpen}
                            sx={{ marginTop: 2 }}
                        >
                            Create Event
                        </Button>
                    )}
                </Grid>

                <Grid item xs={12} md={4} style={{ marginTop: '24px' }}>
                    <SideTab />
                </Grid>
            </Grid>

            <IconButton
                style={{
                    position: 'fixed',
                    bottom: '16px',
                    right: '16px',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                }}
            >
                <NotificationsIcon />
            </IconButton>

            <NewEventModal open={modalOpen} onClose={handleClose} onSubmit={handleEventSubmit} />
        </Container>
    );
};

export default HomePage;
