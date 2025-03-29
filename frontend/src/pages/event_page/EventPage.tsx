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
  Rating,
  Divider,
  Avatar,
  Stack,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material';
import { format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent, assignWorkerToEvent, feedbackWorker } from '../../api/eventApi';
import WorkerApprovalSuccessModal from '../../components/WorkerApprovalSuccessModal';
import WorkerBackupSuccessModal from '../../components/WorkerBackupSuccessModal';
import WorkerRatingModal from './WorkerRatingModal';
import useUserRole from '../home/hooks/useUserRole';
import ResponsiveTabs from '../../components/ResponsiveTabs';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

// Using the existing interfaces from your API
interface EventWorker {
  worker_id: number;
  name: string;
  job_title: string;
  status: string;
  city?: string;
  age?: number;
  rating?: number;
  phone: string;
  rating_count?: number;
  approval_status?: boolean;
  approval_count?: number;
}

interface eventJob{
  job_title: string;
  openings: number;
  slots: number;
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
  jobs: eventJob[];
}

// Create a custom modified version of ResponsiveTabs with navigation support
const EventPageTabs: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState(-1);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    // Navigate based on tab selection
    switch(newValue) {
      case 0: navigate('/'); break;
      case 1: navigate('/schedule'); break;
      case 2: navigate('/chat'); break;
      case 3: navigate('/create'); break;
      case 4: navigate('/data'); break;
      default: break;
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
  const [backupSuccess, setBackupSuccess] = useState<boolean>(false);
  const [approvedWorker, setApprovedWorker] = useState<{ name: string; jobTitle: string }>({
    name: '',
    jobTitle: ''
  });
  const [ratingModalOpen, setRatingModalOpen] = useState<boolean>(false);
  const [selectedWorker, setSelectedWorker] = useState<{
    id: number;
    name: string;
    jobTitle: string;
  }>({
    id: 0,
    name: '',
    jobTitle: ''
  });
  
  const userRole = useUserRole();
  const isHrManager = userRole === 'hr_manager';
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'PPP'); // Format: Apr 29, 2021
  };
  
  const formatTime = (dateString: string): string => {
    return format(new Date(dateString), 'p'); // Format: 5:00 PM
  };
  
  // Check if event spans multiple days
  const isMultiDayEvent = (startDate: string, endDate: string): boolean => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Reset time to midnight to compare just the dates
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    
    return startDay.getTime() !== endDay.getTime();
  };

  // Sort workers - approved workers first, then backup, then pending
  const sortedWorkers = event?.workers ? [...event.workers].sort((a, b) => {
    if (a.status === 'APPROVED' && b.status !== 'APPROVED') return -1;
    if (a.status !== 'APPROVED' && b.status === 'APPROVED') return 1;
    if (a.status === 'BACKUP' && b.status === 'PENDING') return -1;
    if (a.status === 'PENDING' && b.status === 'BACKUP') return 1;
    return 0;
  }) : [];

  // Updated function to handle different worker statuses
  const handleWorkerStatusChange = async (workerId: number, jobTitle: string, workerName: string, status: string) => {
    try {
      if (!eventId) return;
      
      await assignWorkerToEvent({
        event_id: Number(eventId),
        worker_id: workerId,
        job_title: jobTitle,
        status: status
      });
      
      setApprovedWorker({
        name: workerName,
        jobTitle: jobTitle
      });
      
      // Show appropriate success modal based on status
      if (status === "APPROVED") {
        setApprovalSuccess(true);
      } else if (status === "BACKUP") {
        setBackupSuccess(true);
      }
      
      // Refresh event data after successful status change
      const updatedEventData = await getEvent(Number(eventId));
      setEvent(updatedEventData);
    } catch (err) {
      console.error(`Error changing worker status to ${status}:`, err);
      setError(err instanceof Error ? err.message : `Failed to change worker status to ${status}`);
    }
  };
  
  const handleCloseSuccessModal = () => {
    setApprovalSuccess(false);
  };

  const handleCloseBackupModal = () => {
    setBackupSuccess(false);
  };

  const handleOpenRatingModal = (workerId: number, workerName: string, jobTitle: string) => {
    setSelectedWorker({
      id: workerId,
      name: workerName,
      jobTitle
    });
    setRatingModalOpen(true);
  };

  const handleCloseRatingModal = () => {
    setRatingModalOpen(false);
  };

  const handleRatingSuccess = async () => {
    // Refresh event data after successful rating
    if (!eventId) return;
    
    try {
      const updatedEventData = await getEvent(Number(eventId));
      setEvent(updatedEventData);
    } catch (err) {
      console.error("Error refreshing event data:", err);
    }
  };

  // Get event status style
  const getEventStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'planned': return 'primary';
      case 'ongoing': return 'success';
      case 'completed': return 'secondary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // Get worker status style
  const getWorkerStatusColor = (status: string) => {
    switch(status.toUpperCase()) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'BACKUP': return 'info';
      default: return 'default';
    }
  };

  // Get worker status icon
  const getWorkerStatusIcon = (status: string): React.ReactElement | undefined => {
    switch(status.toUpperCase()) {
      case 'APPROVED': return <CheckCircleOutlineIcon />;
      case 'BACKUP': return <AccessTimeOutlinedIcon />;
      case 'PENDING': return <AssignmentIndIcon />;
      default: return undefined;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Count workers by status
  const getWorkerCounts = () => {
    if (!event?.workers) return { approved: 0, backup: 0, pending: 0 };
    
    return event.workers.reduce((counts, worker) => {
      if (worker.status === 'APPROVED') counts.approved += 1;
      else if (worker.status === 'BACKUP') counts.backup += 1;
      else if (worker.status === 'PENDING') counts.pending += 1;
      return counts;
    }, { approved: 0, backup: 0, pending: 0 });
  };

  const workerCounts = getWorkerCounts();

  // Error state view
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4, pt: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '50vh',
            textAlign: 'center'
          }}
        >
          <ErrorOutlineIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h5" color="error" gutterBottom>
            Error Loading Event
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/schedule')}
            startIcon={<HomeOutlinedIcon />}
          >
            Return to Schedule
          </Button>
        </Box>
      </Container>
    );
  }

  const contentView = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} thickness={4} />
        </Box>
      );
    }

    if (!event) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '50vh',
            textAlign: 'center'
          }}
        >
          <ErrorOutlineIcon color="warning" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Event Found
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            The requested event could not be found or has been removed.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/schedule')}
            startIcon={<HomeOutlinedIcon />}
          >
            Return to Schedule
          </Button>
        </Box>
      );
    }

    return (
      <>
        {/* Breadcrumbs Navigation */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link 
            color="inherit" 
            href="/" 
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeOutlinedIcon sx={{ mr: 0.5 }} fontSize="small" />
            Home
          </Link>
          <Typography color="text.primary">{event.name}</Typography>
        </Breadcrumbs>
        
        {/* Event Header with Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 600, 
              color: theme.palette.text.primary 
            }}
          >
            {event.name}
          </Typography>
          
          <Chip 
            label={getStatusLabel(event.status)} 
            color={getEventStatusColor(event.status) as any}
            sx={{ 
              fontWeight: 500, 
              px: 1,
              height: 32
            }}
          />
        </Box>
        
        {/* Event Details Card */}
        <Card 
          elevation={2} 
          sx={{ 
            mb: 4, 
            overflow: 'hidden',
            borderRadius: 2
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Event Description Section */}
            <Box sx={{ p: 3, backgroundColor: 'background.paper' }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  lineHeight: 1.7,
                  color: theme.palette.text.primary
                }}
              >
                {event.description}
              </Typography>
            </Box>
            
            <Divider />
            
            {/* Event Details Section */}
            <Box 
              sx={{ 
                p: 3, 
                backgroundColor: theme.palette.mode === 'light' 
                  ? theme.palette.grey[50] 
                  : theme.palette.background.default
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                      <LocationOnOutlinedIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {event.city}, {event.address}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                      <EventOutlinedIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Date
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {isMultiDayEvent(event.start_datetime, event.end_datetime) 
                          ? `${formatDate(event.start_datetime)} - ${formatDate(event.end_datetime)}` 
                          : formatDate(event.start_datetime)
                        }
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                      <AccessTimeOutlinedIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {isMultiDayEvent(event.start_datetime, event.end_datetime) ? "Times" : "Time"}
                      </Typography>
                      {isMultiDayEvent(event.start_datetime, event.end_datetime) ? (
                        <Box>
                          <Typography variant="subtitle1" fontWeight={500}>
                            Start: {formatTime(event.start_datetime)}
                          </Typography>
                          <Typography variant="subtitle1" fontWeight={500}>
                            End: {formatTime(event.end_datetime)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="subtitle1" fontWeight={500}>
                          {formatTime(event.start_datetime)} - {formatTime(event.end_datetime)}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
        
        {/* Workers Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}
        >
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center' 
            }}
          >
            <PersonOutlinedIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            Event Workers
          </Typography>
          
          {isHrManager && (
            <Stack direction="row" spacing={1.5}>
              <Chip 
                icon={<CheckCircleOutlineIcon />} 
                label={`${workerCounts.approved} Approved`}
                variant="outlined"
                color="success"
                size="small"
              />
              <Chip 
                icon={<AccessTimeOutlinedIcon />} 
                label={`${workerCounts.backup} Backup`}
                variant="outlined"
                color="info"
                size="small"
              />
              <Chip 
                icon={<AssignmentIndIcon />} 
                label={`${workerCounts.pending} Pending`}
                variant="outlined"
                color="warning"
                size="small"
              />
            </Stack>
          )}
        </Box>
        
        {/* Workers Table */}
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            mb: 5,
            overflow: 'hidden'
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900] }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Job Title</TableCell>
                {!isMobile && <TableCell sx={{ fontWeight: 'bold' }}>City</TableCell>}
                {!isMobile && <TableCell sx={{ fontWeight: 'bold' }}>Age</TableCell>}
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                {isHrManager && <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>}
                <TableCell sx={{ fontWeight: 'bold' }}>Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedWorkers.length > 0 ? (
                sortedWorkers.map((worker) => (
                  <TableRow 
                    key={worker.worker_id}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      backgroundColor: 
                        worker.status === 'APPROVED' 
                          ? theme.palette.mode === 'light' 
                            ? 'rgba(46, 125, 50, 0.05)' 
                            : 'rgba(46, 125, 50, 0.15)'
                        : worker.status === 'BACKUP'
                          ? theme.palette.mode === 'light'
                            ? 'rgba(2, 136, 209, 0.05)'
                            : 'rgba(2, 136, 209, 0.15)'
                          : 'inherit',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'light' 
                          ? theme.palette.grey[100] 
                          : theme.palette.grey[800]
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            backgroundColor: 
                              worker.status === 'APPROVED' 
                                ? theme.palette.success.main 
                                : worker.status === 'BACKUP'
                                  ? theme.palette.info.main
                                  : theme.palette.warning.main,
                            mr: 1.5,
                            fontSize: 14
                          }}
                        >
                          {worker.name.charAt(0)}
                        </Avatar>
                        {worker.name}
                      </Box>
                    </TableCell>
                    <TableCell>{worker.job_title}</TableCell>
                    {!isMobile && <TableCell>{worker.city || 'N/A'}</TableCell>}
                    {!isMobile && <TableCell>{worker.age || 'N/A'}</TableCell>}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneOutlinedIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.text.secondary }} />
                        {worker.phone || 'N/A'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Rating
                          name={`rating-${worker.worker_id}`}
                          value={worker.rating || 0}
                          readOnly
                          precision={0.5}
                          size="small"
                          emptyIcon={<StarOutlineIcon fontSize="inherit" />}
                        />
                        {worker.rating_count === 0 || worker.rating_count === undefined ? (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            No ratings yet
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {worker.rating?.toFixed(1) || '0.0'} ({worker.rating_count})
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={worker.status} 
                        color={getWorkerStatusColor(worker.status) as any} 
                        size="small"
                        variant={worker.status === 'PENDING' ? 'outlined' : 'filled'}
                        icon={getWorkerStatusIcon(worker.status)}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    {isHrManager && (
                      <TableCell>
                        {worker.status === 'PENDING' ? (
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Approve this worker">
                              <Button 
                                variant="contained" 
                                size="small" 
                                color="success"
                                onClick={() => handleWorkerStatusChange(worker.worker_id, worker.job_title, worker.name, "APPROVED")}
                                sx={{ 
                                  textTransform: 'none',
                                  borderRadius: 1.5,
                                  boxShadow: 1,
                                  minWidth: 0,
                                  px: 1.5
                                }}
                              >
                                Approve
                              </Button>
                            </Tooltip>
                            <Tooltip title="Add to waiting list">
                              <Button 
                                variant="outlined" 
                                size="small" 
                                color="info"
                                onClick={() => handleWorkerStatusChange(worker.worker_id, worker.job_title, worker.name, "BACKUP")}
                                sx={{ 
                                  textTransform: 'none',
                                  borderRadius: 1.5,
                                  minWidth: 0,
                                  px: 1.5
                                }}
                              >
                                Backup
                              </Button>
                            </Tooltip>
                          </Stack>
                        ) : worker.status === 'BACKUP' ? (
                          <Tooltip title="Approve this worker">
                            <Button 
                              variant="outlined" 
                              size="small" 
                              color="success"
                              onClick={() => handleWorkerStatusChange(worker.worker_id, worker.job_title, worker.name, "APPROVED")}
                              sx={{ 
                                textTransform: 'none',
                                borderRadius: 1.5
                              }}
                            >
                              Promote to Approved
                            </Button>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Worker is approved">
                            <Chip 
                              label="Approved" 
                              color="success" 
                              size="small" 
                              icon={<CheckCircleOutlineIcon />}
                              variant="outlined"
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <Tooltip title="Rate this worker">
                        <Button
                          variant="outlined"
                          size="small"
                          color="secondary"
                          startIcon={<StarIcon />}
                          onClick={() => handleOpenRatingModal(worker.worker_id, worker.name, worker.job_title)}
                          sx={{
                            textTransform: 'none',
                            borderRadius: 1.5
                          }}
                        >
                          Rate
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell 
                    colSpan={isHrManager ? (isMobile ? 7 : 9) : (isMobile ? 6 : 8)} 
                    align="center"
                    sx={{ py: 4 }}
                  >
                    <Typography color="text.secondary">
                      No workers assigned to this event
                    </Typography>
                  </TableCell>
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
      
      {/* Main content with proper spacing to account for navigation */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: { xs: 2, sm: 8 },
          mb: { xs: 10, sm: 4 },
          pt: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 3 }
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

        {/* Worker Backup Success Modal */}
        <WorkerBackupSuccessModal
          open={backupSuccess}
          onClose={handleCloseBackupModal}
          workerName={approvedWorker.name}
          jobTitle={approvedWorker.jobTitle}
        />

        {/* Worker Rating Modal */}
        <WorkerRatingModal
          open={ratingModalOpen}
          onClose={handleCloseRatingModal}
          eventId={Number(eventId)}
          workerId={selectedWorker.id}
          workerName={selectedWorker.name}
          jobTitle={selectedWorker.jobTitle}
          onRatingSuccess={handleRatingSuccess}
        />
      </Container>
    </>
  );
};

export default EventPage;