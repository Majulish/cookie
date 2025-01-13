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
    Paper,
    FormControl,
    Select,
    MenuItem,
    SelectChangeEvent
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MyEventScheme } from '../create_event/eventScheme';
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
    const [selectedJob, setSelectedJob] = useState('');

    const handleJobChange = (event: SelectChangeEvent) => {
        setSelectedJob(event.target.value);
    };

    const handleApply = async () => {
        if (!selectedJob) {
            alert('Please select a job position first');
            return;
        }

        try {
            console.log('Attempting to apply...');
            await applyForJob(event.id, selectedJob);
            console.log('Application successful');
            await queryClient.invalidateQueries(['events']);
            setIsSuccessModalOpen(true);
            setSelectedJob(''); // Reset selection after successful application
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
                            <br />
                            Location: {event.location}
                        </Typography>

                        <Box mt={2}>
                            <Typography variant="subtitle1" gutterBottom>
                                Available Jobs:
                            </Typography>
                            {availableJobs.length > 0 ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FormControl sx={{ minWidth: 200 }}>
                                        <Select
                                            value={selectedJob}
                                            onChange={handleJobChange}
                                            displayEmpty
                                            size="small"
                                        >
                                            <MenuItem value="">
                                                <em>Select a position</em>
                                            </MenuItem>
                                            {availableJobs.map((job, index) => (
                                                <MenuItem 
                                                    key={`${event.id}-${job.id}-${index}`} 
                                                    value={job.job_title}
                                                >
                                                    {job.job_title}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={handleApply}
                                        disabled={!selectedJob}
                                    >
                                        Apply
                                    </Button>
                                </Box>
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