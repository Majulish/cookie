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

    const handleJobChange = (event: SelectChangeEvent) => {
        setSelectedJob(event.target.value);
    };

    const handleApply = async () => {
        if (!selectedJob) {
            alert('Please select a job position first');
            return;
        }

        try {
            await applyForJob(event.id, selectedJob);
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
                        height: '10px', // Slightly increased height for the top bar
                        bgcolor: 'primary.main',
                        width: '100%'
                    }}
                />
                <CardContent sx={{ p: 3.5 }}> {/* Increased padding for more space */}
                    <Grid container spacing={2.5}> {/* Increased spacing */}
                        <Grid item xs={12}>
                            <Typography 
                                variant="h4" // Upgraded from h5 to h4
                                sx={{ 
                                    fontWeight: 600,
                                    color: 'text.primary', 
                                    mb: 2.5, // Increased margin
                                    fontSize: '2rem', // Explicit font size
                                }}
                            >
                                {event.name}
                            </Typography>
                            
                            <Grid container spacing={3.5}> {/* Increased spacing */}
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                        <CalendarTodayIcon 
                                            sx={{ 
                                                color: 'primary.main', 
                                                mr: 1.8, // Increased margin
                                                mt: 0.7, // Adjusted alignment
                                                fontSize: '1.5rem' // Increased icon size
                                            }} 
                                        />
                                        <Box>
                                            <Typography 
                                                variant="subtitle1" // Upgraded from subtitle2
                                                color="text.secondary" 
                                                gutterBottom
                                                sx={{ fontSize: '1.1rem', fontWeight: 500 }}
                                            >
                                                Dates
                                            </Typography>
                                            <Typography 
                                                variant="body1" // Upgraded from body2
                                                sx={{ fontSize: '1.05rem' }}
                                            >
                                                {formatDate(event.start_date)} - {formatDate(event.end_date)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                        <AccessTimeIcon 
                                            sx={{ 
                                                color: 'primary.main', 
                                                mr: 1.8,
                                                mt: 0.7, 
                                                fontSize: '1.5rem' 
                                            }} 
                                        />
                                        <Box>
                                            <Typography 
                                                variant="subtitle1" 
                                                color="text.secondary" 
                                                gutterBottom
                                                sx={{ fontSize: '1.1rem', fontWeight: 500 }}
                                            >
                                                Time
                                            </Typography>
                                            <Typography 
                                                variant="body1"
                                                sx={{ fontSize: '1.05rem' }}
                                            >
                                                {event.start_time} - {event.end_time}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5 }}>
                                        <LocationOnIcon 
                                            sx={{ 
                                                color: 'primary.main', 
                                                mr: 1.8,
                                                mt: 0.7, 
                                                fontSize: '1.5rem' 
                                            }} 
                                        />
                                        <Box>
                                            <Typography 
                                                variant="subtitle1" 
                                                color="text.secondary" 
                                                gutterBottom
                                                sx={{ fontSize: '1.1rem', fontWeight: 500 }}
                                            >
                                                Location
                                            </Typography>
                                            <Typography 
                                                variant="body1"
                                                sx={{ fontSize: '1.05rem' }}
                                            >
                                                {event.address}, {event.city}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            
                            <Box sx={{ mt: 2.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                                    <WorkOutlineIcon 
                                        sx={{ 
                                            color: 'primary.main', 
                                            mr: 1.8, 
                                            fontSize: '1.5rem' 
                                        }} 
                                    />
                                    <Typography 
                                        variant="h6" // Upgraded from subtitle1
                                        fontWeight="medium"
                                        sx={{ fontSize: '1.3rem' }}
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
                                                gap: 1.5, // Increased gap
                                                mb: 2.5 
                                            }}
                                        >
                                            {availableJobs.map((job) => (
                                                <Chip 
                                                    key={job.id} 
                                                    label={`${job.job_title} (${job.openings})`}
                                                    size="medium" // Changed from small to medium
                                                    sx={{ 
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        color: 'primary.dark',
                                                        fontWeight: 500,
                                                        fontSize: '0.95rem', // Increased font size
                                                        height: '32px', // Increased height
                                                        '& .MuiChip-label': {
                                                            px: 2 // More horizontal padding
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                        
                                        <Box 
                                            sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                flexWrap: 'wrap',
                                                gap: 2.5, // Increased gap
                                                bgcolor: 'background.paper',
                                                p: 2.5, // Increased padding
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: 'divider'
                                            }}
                                        >
                                            <FormControl 
                                                sx={{ 
                                                    minWidth: 280, // Wider dropdown
                                                    flex: { xs: '1 1 100%', sm: '1 1 auto' }
                                                }}
                                            >
                                                <Select
                                                    value={selectedJob}
                                                    onChange={handleJobChange}
                                                    displayEmpty
                                                    size="medium" // Changed from small to medium
                                                    sx={{ 
                                                        borderRadius: 1.5,
                                                        '& .MuiSelect-select': { 
                                                            py: 1.8, // Increased padding
                                                            fontSize: '1.05rem' // Larger text
                                                        }
                                                    }}
                                                >
                                                    <MenuItem value="" sx={{ fontSize: '1.05rem' }}>
                                                        <em>Select a position</em>
                                                    </MenuItem>
                                                    {availableJobs.map((job) => (
                                                        <MenuItem 
                                                            key={`${event.id}-${job.id}`} 
                                                            value={job.job_title}
                                                            sx={{ fontSize: '1.05rem' }}
                                                        >
                                                            {job.job_title}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <Button
                                                variant="contained"
                                                size="large" // Changed from medium to large
                                                endIcon={<SendIcon />}
                                                onClick={handleApply}
                                                disabled={!selectedJob}
                                                sx={{ 
                                                    borderRadius: 1.5,
                                                    py: 1.5, // Increased padding
                                                    px: 4, // Increased padding
                                                    fontWeight: 600,
                                                    fontSize: '1rem', // Increased font size
                                                    flex: { xs: '1 1 100%', sm: '0 0 auto' }
                                                }}
                                            >
                                                Apply Now
                                            </Button>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box 
                                        sx={{ 
                                            p: 2.5, 
                                            bgcolor: alpha(theme.palette.warning.light, 0.1),
                                            borderRadius: 1.5,
                                            border: '1px solid',
                                            borderColor: alpha(theme.palette.warning.main, 0.3),
                                        }}
                                    >
                                        <Typography 
                                            variant="body1" // Upgraded from body2
                                            color="text.secondary"
                                            sx={{ fontSize: '1.05rem' }}
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
                                    mt: 1.5, 
                                    boxShadow: 'none', 
                                    '&:before': { display: 'none' },
                                    bgcolor: 'transparent'
                                }}
                            >
                                <AccordionSummary 
                                    expandIcon={<ExpandMoreIcon sx={{ fontSize: '1.6rem' }} />} // Larger icon
                                    aria-controls="description-content"
                                    id="description-header"
                                    sx={{
                                        px: 0,
                                        py: 1.5, // Increased padding
                                        '&.Mui-expanded': {
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            mb: 1.5
                                        }
                                    }}
                                >
                                    <Typography 
                                        variant="h6" // Upgraded from subtitle1
                                        fontWeight="medium"
                                        color="primary"
                                        sx={{ fontSize: '1.3rem' }}
                                    >
                                        Event Description
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ px: 0 }}>
                                    <Typography 
                                        variant="body1" // Upgraded from body2
                                        sx={{ 
                                            whiteSpace: 'pre-line',
                                            color: 'text.secondary',
                                            fontSize: '1.05rem',
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