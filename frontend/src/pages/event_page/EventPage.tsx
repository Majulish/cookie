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
  CircularProgress,
  Rating
} from '@mui/material';
import { format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent, assignWorkerToEvent } from '../../api/eventApi'; 
import WorkerApprovalSuccessModal from '../../components/WorkerApprovalSuccessModal';
import useUserRole from '../home/hooks/useUserRole'; // Import the hook
import ResponsiveTabs from '../../components/ResponsiveTabs';
import SideTab from '../../components/SideTab';

// Using the existing interfaces from your API
interface EventWorker {
  worker_id: number;
  name: string;
  job_title: string;
  status: string;
  city?: string; // Will be added soon
  age?: number;  // Will be added soon
  rating?: number; // Optional rating field
  phone: string; // Optional phone number field
}

interface DetailedEvent {
  id: number;
  name: string;
  description: string;
  city: string;
  address: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
  workers: EventWorker[];
}

// Create a custom modified version of ResponsiveTabs with navigation support
const EventPageTabs: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState(-1); // Set to -1 so no tab is selected

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    // Navigate based on tab selection
    switch(newValue) {
      case 0: // Home
        navigate('/'); // Navigate to home page
        break;
      case 1: // Schedule
        navigate('/schedule'); // Navigate to schedule main page
        break;
      case 2: // Chat
        navigate('/chat');
        break;
      case 3: // Create
        navigate('/create');
        break;
      case 4: // Data
        navigate('/data');
        break;
      default:
        break;
    }
  };

  return <ResponsiveTabs value={value} onChange={handleChange} />;
};

const EventPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<DetailedEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [approvalSuccess, setApprovalSuccess] = useState<boolean>(false);
  const [approvedWorker, setApprovedWorker] = useState<{ name: string; jobTitle: string }>({
    name: '',
    jobTitle: ''
  });
  const userRole = useUserRole(); // Get the user's role
  const isHrManager = userRole === 'hr_manager'; // Check if user is an HR manager

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

  const handleApproveWorker = async (workerId: number, jobTitle: string, workerName: string) => {
    try {
      if (!eventId) return;
      
      await assignWorkerToEvent({
        event_id: Number(eventId),
        worker_id: workerId,
        job_title: jobTitle,
        status: "APPROVED"
      });
      
      // Set approved worker info for the success modal
      setApprovedWorker({
        name: workerName,
        jobTitle: jobTitle
      });
      
      // Show success modal
      setApprovalSuccess(true);
      
      // Refresh event data after successful approval
      const updatedEventData = await getEvent(Number(eventId));
      setEvent(updatedEventData);
    } catch (err) {
      console.error("Error approving worker:", err);
      setError(err instanceof Error ? err.message : 'Failed to approve worker');
    }
  };
  
  const handleCloseSuccessModal = () => {
    setApprovalSuccess(false);
  };

  const contentView = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Typography variant="h6" color="error">{error}</Typography>
      );
    }

    if (!event) {
      return (
        <Typography variant="h6">No event found</Typography>
      );
    }

    return (
      <>
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
                  {event.city}, {event.address}
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
                <TableCell>Phone Number</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Status</TableCell>
                {isHrManager && <TableCell>Actions</TableCell>}
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
                    <TableCell>{worker.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Rating
                        name={`rating-${worker.worker_id}`}
                        value={worker.rating || 0}
                        readOnly
                        precision={0.5}
                      />
                      {!worker.rating && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Not rated yet
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={worker.status} 
                        color={worker.status === 'APPROVED' ? 'success' : 'warning'} 
                        size="small"
                      />
                    </TableCell>
                    {isHrManager && (
                      <TableCell>
                        {worker.status === 'PENDING' && (
                          <Button 
                            variant="contained" 
                            size="small" 
                            color="primary"
                            onClick={() => handleApproveWorker(worker.worker_id, worker.job_title, worker.name)}
                          >
                            Approve Worker
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isHrManager ? 9 : 8} align="center">No workers assigned to this event</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };

  return (
    <>
      {/* Top navigation tabs */}
      <EventPageTabs />
      
      {/* Side navigation */}
      <SideTab />
      
      {/* Main content with proper spacing to account for navigation */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: { xs: 2, sm: 8 }, // Add top margin to account for tabs on desktop
          mb: { xs: 10, sm: 4 }, // Add bottom margin to account for bottom nav on mobile
          pt: { xs: 2, sm: 4 },  // Add padding top
          px: 2 // Add horizontal padding
        }}
      >
        {contentView()}
        
        {/* Worker Approval Success Modal */}
        <WorkerApprovalSuccessModal
          open={approvalSuccess}
          onClose={handleCloseSuccessModal}
          workerName={approvedWorker.name}
          jobTitle={approvedWorker.jobTitle}
        />
      </Container>
    </>
  );
};

export default EventPage;