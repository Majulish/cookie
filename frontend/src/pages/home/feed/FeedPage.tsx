import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Paper, 
  useTheme, 
  CircularProgress
} from '@mui/material';
import { useQuery } from 'react-query';
import SearchIcon from '@mui/icons-material/Search';
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
  
  // Always call the useQuery hook, regardless of userRole
  // But only enable it when the role is 'worker'
  const { data: feedEvents = [], isLoading: isFeedLoading } = useQuery(
    ['eventsFeed'], 
    getEventsFeed,
    { 
      enabled: userRole === 'worker',
      // Add retry: false to prevent unnecessary retries when not enabled
      retry: userRole === 'worker'
    }
  );
  
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);

  useEffect(() => {
    if (feedEvents && feedEvents.length > 0) {
      setFilteredEvents(feedEvents);
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
        <CircularProgress size={40} />
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
        pb: 8 
      }}
    >
      <Container maxWidth="xl" sx={{ pt: 3, pb: 6 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 2,
                mb: 3,
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
                p: 3, 
                borderRadius: 2,
                height: '100%',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FeedIcon 
                    sx={{ 
                      color: 'primary.main',
                      mr: 1.5,
                      fontSize: '2.2rem'
                    }} 
                  />
                  <Typography 
                    variant="h5" 
                    component="h1" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary',
                      fontSize: '2rem'
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
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={28} color="primary" />
                </Box>
              ) : filteredEvents.length === 0 ? (
                <Box 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                    mt: 3
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No events match your filters
                  </Typography>
                </Box>
              ) : (
                <Box mt={3}>
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