import React, { useState, useEffect, useRef } from 'react';
import {
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
    SelectChangeEvent,
    Chip,
    Grid,
    Divider,
    useTheme,
    alpha
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SendIcon from '@mui/icons-material/Send';
import { MyEventScheme } from '../create_event/eventScheme';
import { applyForJob } from '../../../api/eventApi';
import { useQueryClient } from 'react-query';
import ApplicationSuccessModal from '../../../components/ApplicationSuccessModal';

interface EventFeedProps {
    event: MyEventScheme;
}

const EventFeed: React.FC<EventFeedProps> = ({ event }) => {
    const theme = useTheme();
    const availableJobs = event.jobs.filter(job => job.openings > 0);
    const queryClient = useQueryClient();
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const appliedJobTitle = useRef('');
    
    // This ref will track if we need to refetch data
    const needsRefetch = useRef(false);

    const handleJobChange = (event: SelectChangeEvent) => {
        setSelectedJob(event.target.value);
    };

    const handleApply = async () => {
        if (!selectedJob) {
            alert('Please select a job position first');
            return;
        }

        // Prevent double submissions
        if (isApplying) {
            return;
        }

        setIsApplying(true);

        try {
            // Store the selected job title for later reference
            appliedJobTitle.current = selectedJob;
            
            // Make the API call
            await applyForJob(event.id, selectedJob);
            
            // Mark that we need to refetch, but don't do it yet
            needsRefetch.current = true;
            
            // Show the success modal
            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error("Failed to apply for job:", error);
            alert('Failed to apply for job. Please try again.');
            // Reset applying state on error
            setIsApplying(false);
        }
    };

    const handleCloseSuccessModal = () => {
        // First close the modal
        setIsSuccessModalOpen(false);
        
        // Reset states AFTER modal is closed
        setTimeout(() => {
            // Only now perform the refetch
            if (needsRefetch.current) {
                queryClient.invalidateQueries(['events']);
                queryClient.invalidateQueries(['eventsFeed']);
                needsRefetch.current = false;
            }
            
            // Reset the selection and applying state
            setSelectedJob('');
            setIsApplying(false);
        }, 100);
    };

    // Format dates for display
    const formatDate = (dateStr: string) => {
        try {
            const [day, month, year] = dateStr.split('/');
            const date = new Date(`${month}/${day}/${year}`);
            
            // Format date as "Mon, Jan 15, 2023"
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (error) {
            return dateStr;
        }
    };

    return (
        <>
            <Paper 
                elevation={isHovered ? 3 : 1} 
                sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    transform: isHovered ? 'translateY(-4px)' : 'none',
                    border: '1px solid',
                    borderColor: isHovered ? 'primary.light' : 'divider',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Box 
                    sx={{
                        height: '6px',
                        bgcolor: 'primary.main',
                        width: '100%'
                    }}
                />
                <CardContent sx={{ p: 2.5 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography 
                                variant="h5"
                                sx={{ 
                                    fontWeight: 600,
                                    color: 'text.primary', 
                                    mb: 2, 
                                    fontSize: '1.5rem',
                                }}
                            >
                                {event.name}
                            </Typography>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                                        <CalendarTodayIcon 
                                            sx={{ 
                                                color: 'primary.main', 
                                                mr: 1.5, 
                                                mt: 0.5, 
                                                fontSize: '1.2rem'
                                            }} 
                                        />
                                        <Box>
                                            <Typography 
                                                variant="subtitle1"
                                                color="text.secondary" 
                                                gutterBottom
                                                sx={{ fontSize: '0.9rem', fontWeight: 500 }}
                                            >
                                                Dates
                                            </Typography>
                                            <Typography 
                                                variant="body1"
                                                sx={{ fontSize: '0.9rem' }}
                                            >
                                                {formatDate(event.start_date)} - {formatDate(event.end_date)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                                        <AccessTimeIcon 
                                            sx={{ 
                                                color: 'primary.main', 
                                                mr: 1.5,
                                                mt: 0.5, 
                                                fontSize: '1.2rem'
                                            }} 
                                        />
                                        <Box>
                                            <Typography 
                                                variant="subtitle1" 
                                                color="text.secondary" 
                                                gutterBottom
                                                sx={{ fontSize: '0.9rem', fontWeight: 500 }}
                                            >
                                                Time
                                            </Typography>
                                            <Typography 
                                                variant="body1"
                                                sx={{ fontSize: '0.9rem' }}
                                            >
                                                {event.start_time} - {event.end_time}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                        <LocationOnIcon 
                                            sx={{ 
                                                color: 'primary.main', 
                                                mr: 1.5,
                                                mt: 0.5, 
                                                fontSize: '1.2rem'
                                            }} 
                                        />
                                        <Box>
                                            <Typography 
                                                variant="subtitle1" 
                                                color="text.secondary" 
                                                gutterBottom
                                                sx={{ fontSize: '0.9rem', fontWeight: 500 }}
                                            >
                                                Location
                                            </Typography>
                                            <Typography 
                                                variant="body1"
                                                sx={{ fontSize: '0.9rem' }}
                                            >
                                                {event.address}, {event.city}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1.5 }} />
                            
                            <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                    <WorkOutlineIcon 
                                        sx={{ 
                                            color: 'primary.main', 
                                            mr: 1.5, 
                                            fontSize: '1.2rem'
                                        }} 
                                    />
                                    <Typography 
                                        variant="h6"
                                        fontWeight="medium"
                                        sx={{ fontSize: '1rem' }}
                                    >
                                        Available Positions
                                    </Typography>
                                </Box>
                                
                                {availableJobs.length > 0 ? (
                                    <Box>
                                        <Box 
                                            sx={{ 
                                                display: 'flex', 
                                                flexWrap: 'wrap', 
                                                gap: 1, 
                                                mb: 2 
                                            }}
                                        >
                                            {availableJobs.map((job) => (
                                                <Chip 
                                                    key={`job-chip-${event.id}-${job.id}`}
                                                    label={`${job.job_title} (${job.openings})`}
                                                    size="small"
                                                    sx={{ 
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        color: 'primary.dark',
                                                        fontWeight: 500,
                                                        fontSize: '0.8rem',
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                        
                                        <Box 
                                            sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                flexWrap: 'wrap',
                                                gap: 1.5, 
                                                bgcolor: 'background.paper',
                                                p: 1.5, 
                                                borderRadius: 1,
                                                border: '1px solid',
                                                borderColor: 'divider'
                                            }}
                                        >
                                            <FormControl 
                                                sx={{ 
                                                    minWidth: 200,
                                                    flex: { xs: '1 1 100%', sm: '1 1 auto' }
                                                }}
                                                size="small"
                                            >
                                                <Select
                                                    value={selectedJob}
                                                    onChange={handleJobChange}
                                                    displayEmpty
                                                    sx={{ 
                                                        borderRadius: 1,
                                                        '& .MuiSelect-select': { 
                                                            fontSize: '0.875rem'
                                                        }
                                                    }}
                                                >
                                                    <MenuItem value="" sx={{ fontSize: '0.875rem' }}> 
                                                        <em>Select a position</em>
                                                    </MenuItem>
                                                    {availableJobs.map((job) => (
                                                        <MenuItem 
                                                            key={`${event.id}-${job.id}`} 
                                                            value={job.job_title}
                                                            sx={{ fontSize: '0.875rem' }} 
                                                        >
                                                            {job.job_title}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                endIcon={<SendIcon />}
                                                onClick={handleApply}
                                                disabled={!selectedJob || isApplying}
                                                sx={{ 
                                                    borderRadius: 1,
                                                    fontWeight: 500,
                                                    fontSize: '0.875rem', 
                                                    flex: { xs: '1 1 100%', sm: '0 0 auto' }
                                                }}
                                            >
                                                {isApplying ? 'Applying...' : 'Apply Now'}
                                            </Button>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box 
                                        sx={{ 
                                            p: 1.5, 
                                            bgcolor: alpha(theme.palette.warning.light, 0.1),
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: alpha(theme.palette.warning.main, 0.3),
                                        }}
                                    >
                                        <Typography 
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ fontSize: '0.875rem' }}
                                        >
                                            No positions are currently available for this event.
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Accordion 
                                sx={{ 
                                    mt: 1, 
                                    boxShadow: 'none', 
                                    '&:before': { display: 'none' },
                                    bgcolor: 'transparent'
                                }}
                            >
                                <AccordionSummary 
                                    expandIcon={<ExpandMoreIcon sx={{ fontSize: '1.2rem' }} />} 
                                    aria-controls="description-content"
                                    id="description-header"
                                    sx={{
                                        px: 0,
                                        py: 1, 
                                        '&.Mui-expanded': {
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            mb: 1
                                        }
                                    }}
                                >
                                    <Typography 
                                        variant="subtitle1"
                                        fontWeight="medium"
                                        color="primary"
                                        sx={{ fontSize: '0.9rem' }}
                                    >
                                        Event Description
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ px: 0 }}>
                                    <Typography 
                                        variant="body2"
                                        sx={{ 
                                            whiteSpace: 'pre-line',
                                            color: 'text.secondary',
                                            fontSize: '0.875rem',
                                            lineHeight: 1.5
                                        }}
                                    >
                                        {event.description}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                    </Grid>
                </CardContent>
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