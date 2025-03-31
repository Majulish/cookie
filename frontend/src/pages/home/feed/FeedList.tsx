import React from 'react';
import { 
    Stack, 
    Typography, 
    Box, 
    CircularProgress, 
    Paper, 
    useTheme, 
    alpha,
    Fade
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EventFeed from '../feed/EvenFeed';
import { MyEventScheme } from '../create_event/eventScheme';

interface FeedListProps {
    events: MyEventScheme[];
    isLoading?: boolean;
}

const FeedList: React.FC<FeedListProps> = ({ events, isLoading = false }) => {
    const theme = useTheme();
    
    if (isLoading) {
        return (
            <Box 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    flexDirection: 'column',
                    py: 6
                }}
            >
                <CircularProgress size={32} thickness={4} /> {/* Reduced from 48 */}
                <Typography 
                    variant="body2" // Changed from body1 to body2
                    color="text.secondary" 
                    sx={{ mt: 2, fontSize: '0.875rem' }} // Reduced from 1.2rem
                >
                    Loading events...
                </Typography>
            </Box>
        );
    }
    
    if (events.length === 0) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 3, // Reduced from 4.5
                    textAlign: 'center',
                    borderRadius: 1, // Reduced from 2
                    bgcolor: alpha(theme.palette.primary.light, 0.05),
                    border: '1px dashed',
                    borderColor: alpha(theme.palette.primary.main, 0.2)
                }}
            >
                <EventNoteIcon 
                    sx={{ 
                        fontSize: 40, // Reduced from 56
                        color: alpha(theme.palette.primary.main, 0.5),
                        mb: 2
                    }} 
                />
                <Typography 
                    variant="h6" // Changed from h5 to h6
                    gutterBottom 
                    color="text.secondary"
                    sx={{ fontSize: '1.1rem' }} // Reduced from 1.7rem
                >
                    No Events Available
                </Typography>
                <Typography 
                    variant="body2" // Changed from body1 to body2
                    color="text.secondary"
                    sx={{ fontSize: '0.875rem' }} // Reduced from 1.2rem
                >
                    Check back later or try different filter criteria.
                </Typography>
            </Paper>
        );
    }

    return (
        <Box>
            <Box 
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2.5 // Reduced from 3
                }}
            >
                <Box 
                    sx={{ 
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <EventNoteIcon 
                        sx={{ 
                            color: 'primary.main',
                            mr: 1,
                            fontSize: '1.1rem' // Reduced from 1.7rem
                        }} 
                    />
                    <Typography 
                        variant="subtitle1" // Changed from h6 to subtitle1
                        fontWeight={600}
                        sx={{ fontSize: '1rem' }} // Reduced from 1.7rem
                    >
                        {events.length} Event{events.length !== 1 ? 's' : ''} Found
                    </Typography>
                </Box>
            </Box>

            <Stack spacing={2.5}> {/* Reduced from 3.5 */}
                {events.map((event, index) => (
                    <Fade 
                        key={event.id} 
                        in={true} 
                        timeout={(index + 1) * 150} // Reduced from 200
                        style={{ transitionDelay: `${index * 30}ms` }} // Reduced from 50ms
                    >
                        <Box>
                            <EventFeed event={event} />
                        </Box>
                    </Fade>
                ))}
            </Stack>
        </Box>
    );
};

export default FeedList;