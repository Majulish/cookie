import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Paper, 
  useTheme, 
  CircularProgress,
  alpha  // Added import for alpha function
} from '@mui/material';
import { useQuery } from 'react-query';
import FeedIcon from '@mui/icons-material/Feed';
import ResponsiveTabs from '../../../components/ResponsiveTabs';
import { getEventsFeed } from '../../../api/eventApi';
import FeedList from './FeedList';
import EventFilters from './EventFilters';
import useUserRole from '../hooks/useUserRole';
import { Navigate } from 'react-router-dom';

const FeedPage: React.FC = () => {
  const theme = useTheme();
  const userRole = useUserRole();
  
  // Query configuration with better error handling and refresh on focus
  const { 
    data: feedEvents = [], 
    isLoading: isFeedLoading,
    refetch
  } = useQuery(
    ['eventsFeed'], 
    getEventsFeed,
    { 
      enabled: userRole === 'worker',
      retry: userRole === 'worker',
      refetchOnWindowFocus: true,
      onError: (error) => {
        console.error('Failed to fetch events:', error);
      }
    }
  );
  
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);

  useEffect(() => {
    if (feedEvents && feedEvents.length > 0) {
      setFilteredEvents(feedEvents);
    } else {
      setFilteredEvents([]);
    }
  }, [feedEvents]);

  const handleFilterChange = (cities: string[], jobTitles: string[]) => {
    let filtered = [...feedEvents];
    
    // Filter by cities (if any selected)
    if (cities.length > 0) {
      filtered = filtered.filter(event => 
        cities.includes(event.city)
      );
    }
    
    // Filter by job titles (if any selected)
    if (jobTitles.length > 0) {
      filtered = filtered.filter(event => 
        event.jobs.some(job => jobTitles.includes(job.job_title))
      );
    }
    
    setFilteredEvents(filtered);
  };

  // Handle loading state for user role
  if (userRole === undefined) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={32} /> {/* Reduced from 40 */}
      </Box>
    );
  }
  
  // Redirect non-worker users to home after the role has been determined
  if (userRole !== 'worker') {
    console.log('Access denied: Current role is', userRole);
    return <Navigate to="/" replace />;
  }

  return (
    <Box 
      sx={{ 
        bgcolor: 'background.default',
        minHeight: '100vh',
        pb: 6 // Reduced from 8
      }}
    >
      <Container maxWidth="lg"> {/* Changed from xl to lg for more compact layout */}
        <Grid container spacing={2}> {/* Reduced from 3 */}
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 1, // Reduced from 2
                mt: 2, // Added margin top
                mb: 2, // Reduced from 3
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <ResponsiveTabs value={2} /> {/* Set initial value to 2 for Feed tab */}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5, // Reduced from 3
                borderRadius: 1, // Reduced from 2
                height: '100%',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2.5, // Reduced from 3
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FeedIcon 
                    sx={{ 
                      color: 'primary.main',
                      mr: 1.5,
                      fontSize: '1.5rem' // Reduced from 2.2rem
                    }} 
                  />
                  <Typography 
                    variant="h6" // Changed from h5 to h6
                    component="h1" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary',
                      fontSize: '1.25rem' // Reduced from 2rem
                    }}
                  >
                    Available Events
                  </Typography>
                </Box>
              </Box>
              
              <EventFilters 
                events={feedEvents} 
                onFilterChange={handleFilterChange}
              />
              
              {isFeedLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}> {/* Reduced from 4 */}
                  <CircularProgress size={24} color="primary" /> {/* Reduced from 28 */}
                </Box>
              ) : filteredEvents.length === 0 && !isFeedLoading ? (
                <Box 
                  sx={{ 
                    p: 2, // Reduced from 3
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.background.paper, 0.5), // Used alpha for better appearance
                    borderRadius: 1, // Reduced from 2
                    mt: 2, // Reduced from 3
                    border: '1px dashed', // Added dashed border
                    borderColor: alpha(theme.palette.divider, 0.7) // Added border color
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    No events match your filters
                  </Typography>
                </Box>
              ) : (
                <Box mt={2}> {/* Reduced from 3 */}
                  <FeedList events={filteredEvents} />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default FeedPage;