import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Button,
    Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MyEventScheme } from '../crate_event/eventScheme';
import { applyForJob } from '../../../api/eventApi';
import { useQueryClient } from 'react-query';
import ApplicationSuccessModal from '../../../components/ApplicationSuccessModal';

interface EventFeedProps {
    event: MyEventScheme;
}

const EventFeed: React.FC<EventFeedProps> = ({ event }) => {
    const availableJobs = event.jobs.filter(job => job.openings > 0);
    const queryClient = useQueryClient();
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const handleApply = async (jobTitle: string) => {
        try {
            console.log('Attempting to apply...');
            await applyForJob(event.id, jobTitle);
            console.log('Application successful');
            await queryClient.invalidateQueries(['events']);
            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error("Failed to apply for job:", error);
            alert('Failed to apply for job. Please try again.');
        }
    };

    const handleCloseSuccessModal = () => {
        setIsSuccessModalOpen(false);
    };

    return (
        <>
            <Paper 
                elevation={3} 
                sx={{ 
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    '&:hover': {
                        boxShadow: 6,
                        transform: 'scale(1.01)',
                        transition: 'all 0.2s ease-in-out'
                    }
                }}
            >
                <Card sx={{ bgcolor: 'background.default' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {event.name}
                        </Typography>
                        
                        <Typography variant="body1" color="textSecondary" gutterBottom>
                            From: {event.start_date} {event.start_time}
                            <br />
                            To: {event.end_date} {event.end_time}
                        </Typography>

                        <Box mt={2}>
                            <Typography variant="subtitle1" gutterBottom>
                                Available Jobs:
                            </Typography>
                            {availableJobs.length > 0 ? (
                                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                    {availableJobs.map((job, index) => (
                                        <li key={`${event.id}-${job.id}-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <Typography variant="body2" style={{ marginRight: '16px' }}>
                                                {job.job_title} ({job.openings} positions available)
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleApply(job.job_title)}
                                            >
                                                Apply
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    No available positions at this time
                                </Typography>
                            )}
                        </Box>

                        <Accordion sx={{ mt: 2, boxShadow: 'none', '&:before': { display: 'none' } }}>
                            <AccordionSummary 
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="description-content"
                                id="description-header"
                            >
                                <Typography>View Description</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body2">
                                    {event.description}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    </CardContent>
                </Card>
            </Paper>

            <ApplicationSuccessModal
                open={isSuccessModalOpen}
                onClose={handleCloseSuccessModal}
                eventName={event.name}
            />
        </>
    );
};

export default EventFeed;