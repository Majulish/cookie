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
                    py: 8
                }}
            >
                <CircularProgress size={48} thickness={4} /> {/* Increased size */}
                <Typography 
                    variant="body1"
                    color="text.secondary" 
                    sx={{ mt: 2, fontSize: '1.2rem' }} // Increased to match MyEventList
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
                    p: 4.5, // Increased padding
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.light, 0.05),
                    border: '1px dashed',
                    borderColor: alpha(theme.palette.primary.main, 0.2)
                }}
            >
                <EventNoteIcon 
                    sx={{ 
                        fontSize: 56, // Larger icon
                        color: alpha(theme.palette.primary.main, 0.5),
                        mb: 2.5
                    }} 
                />
                <Typography 
                    variant="h5"
                    gutterBottom 
                    color="text.secondary"
                    sx={{ fontSize: '1.7rem' }} // Increased to match MyEventList header
                >
                    No Events Available
                </Typography>
                <Typography 
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontSize: '1.2rem' }} // Increased to match MyEventList
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
                    mb: 3
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
                            mr: 1.5,
                            fontSize: '1.7rem' // Increased to match MyEventList
                        }} 
                    />
                    <Typography 
                        variant="h6"
                        fontWeight={600}
                        sx={{ fontSize: '1.7rem' }} // Increased to match MyEventList header
                    >
                        {events.length} Event{events.length !== 1 ? 's' : ''} Found
                    </Typography>
                </Box>
            </Box>

            <Stack spacing={3.5}> {/* Increased spacing */}
                {events.map((event, index) => (
                    <Fade 
                        key={event.id} 
                        in={true} 
                        timeout={(index + 1) * 200}
                        style={{ transitionDelay: `${index * 50}ms` }}
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