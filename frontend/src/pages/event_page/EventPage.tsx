import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Container,
  Grid,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import { getEvent } from '../../api/eventApi'; 

// Using the existing interfaces from your API
interface EventWorker {
  worker_id: number;
  name: string;
  job_title: string;
  status: string;
  city?: string; // Will be added soon
  age?: number;  // Will be added soon
}

interface DetailedEvent {
  id: number;
  name: string;
  description: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
  workers: EventWorker[];
}

const EventPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<DetailedEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) {
        setError('Event ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const eventData = await getEvent(Number(eventId));
        setEvent(eventData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch event data');
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  // Format dates for display
  const formatDateTime = (dateString: string): string => {
    return format(new Date(dateString), 'PPP p'); // Format: Apr 29, 2021, 5:00 PM
  };

  // Sort workers - approved workers first, then pending
  const sortedWorkers = event?.workers ? [...event.workers].sort((a, b) => {
    if (a.status === 'APPROVED' && b.status === 'PENDING') return -1;
    if (a.status === 'PENDING' && b.status === 'APPROVED') return 1;
    return 0;
  }) : [];

  const handleApproveWorker = (workerId: number) => {
    console.log(`Approve worker with ID: ${workerId}`);
    // This function will be implemented later to call the API
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6">No event found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Event Header */}
      <Typography variant="h3" component="h1" gutterBottom>
        {event.name}
      </Typography>
      
      {/* Event Details Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body1" paragraph>
                {event.description}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" fontWeight="bold">
                Location:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {event.location}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" fontWeight="bold">
                Start Time:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatDateTime(event.start_datetime)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" fontWeight="bold">
                End Time:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatDateTime(event.end_datetime)}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Chip 
                label={event.status.toUpperCase()} 
                color={event.status === 'planned' ? 'primary' : 'default'}
                sx={{ mt: 1 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Workers Table */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        Event Workers
      </Typography>
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Worker ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Job Title</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedWorkers.length > 0 ? (
              sortedWorkers.map((worker) => (
                <TableRow 
                  key={worker.worker_id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    backgroundColor: worker.status === 'APPROVED' ? 'rgba(46, 125, 50, 0.05)' : 'inherit'
                  }}
                >
                  <TableCell>{worker.worker_id}</TableCell>
                  <TableCell>{worker.name}</TableCell>
                  <TableCell>{worker.job_title}</TableCell>
                  <TableCell>{worker.city || 'N/A'}</TableCell>
                  <TableCell>{worker.age || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={worker.status} 
                      color={worker.status === 'APPROVED' ? 'success' : 'warning'} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {worker.status === 'PENDING' && (
                      <Button 
                        variant="contained" 
                        size="small" 
                        color="primary"
                        onClick={() => handleApproveWorker(worker.worker_id)}
                      >
                        Approve Worker
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">No workers assigned to this event</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default EventPage;