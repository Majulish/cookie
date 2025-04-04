import React from 'react';
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
  useMediaQuery,
  Tooltip,
  LinearProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import WorkerApprovalSuccessModal from '../../components/WorkerApprovalSuccessModal';
import WorkerBackupSuccessModal from '../../components/WorkerBackupSuccessModal';
import WorkerRatingModal from './WorkerRatingModal';
import useUserRole from '../home/hooks/useUserRole';
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
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import GroupIcon from '@mui/icons-material/Group';
import RateReviewIcon from '@mui/icons-material/RateReview';
import VerifiedIcon from '@mui/icons-material/Verified';
import CancelIcon from '@mui/icons-material/Cancel';

// Import our custom hooks
import useEventData from './hooks/useEventData';
import useWorkerActions from './hooks/useWorkerActions';
import useEventUtils from './hooks/useEventUtils';

const EventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const userRole = useUserRole();
  const isHrManager = userRole === 'hr_manager';
  
  // Use our custom hooks
  const eventUtils = useEventUtils();
  const { theme, formatDate, formatTime, getEventStatusColor, getWorkerStatusColor, getStatusLabel } = eventUtils;
  
  const { 
    event, 
    loading, 
    error, 
    sortedWorkers, 
    workerCounts, 
    isMultiDayEvent, 
    refreshEventData,
    jobStats,
    jobsWithWorkerCounts
  } = useEventData(eventId);
  
  const {
    approvalSuccess,
    backupSuccess,
    approvedWorker,
    ratingModalOpen,
    selectedWorker,
    handleWorkerStatusChange,
    handleCloseSuccessModal,
    handleCloseBackupModal,
    handleOpenRatingModal,
    handleCloseRatingModal,
    handleRatingSuccess
  } = useWorkerActions(eventId, refreshEventData);

  // Determine which columns to show based on screen size
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get worker status icon
  const getWorkerStatusIcon = (status: string): React.ReactElement | undefined => {
    switch(status.toUpperCase()) {
      case 'APPROVED': return <CheckCircleOutlineIcon />;
      case 'BACKUP': return <AccessTimeOutlinedIcon />;
      case 'PENDING': return <AssignmentIndIcon />;
      default: return undefined;
    }
  };

  // Error state view
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mb: 4 }}>
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
          <Typography variant="h5" color="error" gutterBottom sx={{ fontSize: '1.3rem' }}>
            Error Loading Event
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4} sx={{ fontSize: '1.2rem' }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/schedule')}
            startIcon={<HomeOutlinedIcon />}
            sx={{ fontSize: '1.1rem', padding: '8px 20px' }}
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
          <Typography variant="h5" gutterBottom sx={{ fontSize: '1.3rem' }}>
            No Event Found
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4} sx={{ fontSize: '1.2rem' }}>
            The requested event could not be found or has been removed.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            startIcon={<HomeOutlinedIcon />}
            sx={{ fontSize: '1.1rem', padding: '8px 20px' }}
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
            sx={{ display: 'flex', alignItems: 'center', fontSize: '1.1rem' }}
          >
            <HomeOutlinedIcon sx={{ mr: 0.5 }} fontSize="small" />
            Home
          </Link>
          <Typography color="text.primary" sx={{ fontSize: '1.1rem' }}>{event.name}</Typography>
        </Breadcrumbs>
        
        {/* Event Header with Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 600, 
              color: theme.palette.text.primary,
              fontSize: '2rem'
            }}
          >
            {event.name}
          </Typography>
          
          <Chip 
            label={getStatusLabel(event.status)} 
            color={getEventStatusColor(event.status)}
            sx={{ 
              fontWeight: 500, 
              px: 1,
              height: 32,
              fontSize: '1rem'
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
                  color: theme.palette.text.primary,
                  fontSize: '1.2rem'
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
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                        Location
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={500} sx={{ fontSize: '1.2rem' }}>
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
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                        Date
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={500} sx={{ fontSize: '1.2rem' }}>
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
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                        {isMultiDayEvent(event.start_datetime, event.end_datetime) ? "Times" : "Time"}
                      </Typography>
                      {isMultiDayEvent(event.start_datetime, event.end_datetime) ? (
                        <Box>
                          <Typography variant="subtitle1" fontWeight={500} sx={{ fontSize: '1.2rem' }}>
                            Start: {formatTime(event.start_datetime)}
                          </Typography>
                          <Typography variant="subtitle1" fontWeight={500} sx={{ fontSize: '1.2rem' }}>
                            End: {formatTime(event.end_datetime)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="subtitle1" fontWeight={500} sx={{ fontSize: '1.2rem' }}>
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
        
        {/* Jobs and Staffing Overview Card */}
        <Card 
          elevation={2} 
          sx={{ 
            mb: 4, 
            overflow: 'hidden',
            borderRadius: 2
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, backgroundColor: 'background.paper' }}>
              <Typography 
                variant="h6" 
                component="h2" 
                sx={{ 
                  fontWeight: 600, 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 2,
                  fontSize: '1.7rem'
                }}
              >
                <WorkOutlineIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: '2.2rem' }} />
                Staffing Overview
              </Typography>
              
              {/* Overall Staffing Progress */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontSize: '1.3rem' }}>Overall Staffing Progress</Typography>
                  <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '1.2rem' }}>
                    {jobStats.filledPositions}/{jobStats.totalSlots} positions filled
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(jobStats.filledPositions / Math.max(1, jobStats.totalSlots)) * 100} 
                  color="success"
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    mb: 1,
                    backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.12)'
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip 
                    label={`${jobStats.totalOpenings} positions remaining`} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                    icon={<GroupIcon fontSize="small" />}
                    sx={{ fontWeight: 500, fontSize: '1rem' }}
                  />
                  <Chip 
                    label={`${jobStats.totalSlots} total positions`} 
                    size="small" 
                    color="default"
                    variant="outlined"
                    icon={<PersonOutlinedIcon fontSize="small" />}
                    sx={{ fontSize: '1rem' }}
                  />
                </Box>
              </Box>
              
              {/* Jobs Breakdown */}
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, fontSize: '1.3rem' }}>
                Jobs Breakdown
              </Typography>
              <TableContainer component={Paper} sx={{ boxShadow: 'none', mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900] }}>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Job Title</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Openings</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Slots</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Approved</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Backup</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Pending</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobsWithWorkerCounts.map((job, index) => (
                      <TableRow key={`job-${index}`}>
                        <TableCell sx={{ fontWeight: 500, fontSize: '1.1rem' }}>{job.job_title}</TableCell>
                        <TableCell sx={{ fontSize: '1.1rem' }}>{job.openings}</TableCell>
                        <TableCell sx={{ fontSize: '1.1rem' }}>{job.slots}</TableCell>
                        <TableCell>
                          <Chip 
                            label={job.workerCounts.approved} 
                            size="small" 
                            color="success"
                            variant={job.workerCounts.approved > 0 ? "filled" : "outlined"}
                            sx={{ minWidth: 60, fontSize: '0.9rem' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={job.workerCounts.backup} 
                            size="small" 
                            color="info"
                            variant={job.workerCounts.backup > 0 ? "filled" : "outlined"}
                            sx={{ minWidth: 60, fontSize: '0.9rem' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={job.workerCounts.pending} 
                            size="small" 
                            color="warning"
                            variant={job.workerCounts.pending > 0 ? "filled" : "outlined"}
                            sx={{ minWidth: 60, fontSize: '0.9rem' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
              alignItems: 'center',
              fontSize: '2rem'
            }}
          >
            <PersonOutlinedIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: '2.2rem' }} />
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
                sx={{ fontSize: '0.9rem' }}
              />
              <Chip 
                icon={<AccessTimeOutlinedIcon />} 
                label={`${workerCounts.backup} Backup`}
                variant="outlined"
                color="info"
                size="small"
                sx={{ fontSize: '0.9rem' }}
              />
              <Chip 
                icon={<AssignmentIndIcon />} 
                label={`${workerCounts.pending} Pending`}
                variant="outlined"
                color="warning"
                size="small"
                sx={{ fontSize: '0.9rem' }}
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
            overflow: 'hidden',
            width: '100%',
            maxWidth: '100%'
          }}
        >
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 950 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900] }}>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>Job Title</TableCell>
                {!isMobile && !isTablet && <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>City</TableCell>}
                {!isMobile && !isTablet && <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>Age</TableCell>}
                {!isMobile && <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>Phone</TableCell>}
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>Status</TableCell>
                {isHrManager && <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>Actions</TableCell>}
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>Rate&Review</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>Arrival Confirmation</TableCell>
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
                            ? 'rgba(46, 125, 50, 0.12)' 
                            : 'rgba(46, 125, 50, 0.25)'
                        : worker.status === 'BACKUP'
                          ? theme.palette.mode === 'light'
                            ? 'rgba(2, 136, 209, 0.12)'
                            : 'rgba(2, 136, 209, 0.25)'
                          : worker.status === 'PENDING'
                            ? theme.palette.mode === 'light'
                              ? 'rgba(237, 108, 2, 0.08)'
                              : 'rgba(237, 108, 2, 0.18)'
                            : 'inherit',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: 
                          worker.status === 'APPROVED' 
                            ? theme.palette.mode === 'light' 
                              ? 'rgba(46, 125, 50, 0.18)' 
                              : 'rgba(46, 125, 50, 0.35)'
                            : worker.status === 'BACKUP'
                              ? theme.palette.mode === 'light'
                                ? 'rgba(2, 136, 209, 0.18)'
                                : 'rgba(2, 136, 209, 0.35)'
                              : worker.status === 'PENDING'
                                ? theme.palette.mode === 'light'
                                  ? 'rgba(237, 108, 2, 0.15)'
                                  : 'rgba(237, 108, 2, 0.25)'
                                : theme.palette.mode === 'light' 
                                  ? theme.palette.grey[200] 
                                  : theme.palette.grey[700]
                      },
                      borderLeft: worker.status === 'APPROVED' 
                        ? `4px solid ${theme.palette.success.main}` 
                        : worker.status === 'BACKUP'
                          ? `4px solid ${theme.palette.info.main}`
                          : worker.status === 'PENDING'
                            ? `4px solid ${theme.palette.warning.main}`
                            : 'none'
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
                        <Link
                          component="button"
                          onClick={() => navigate(`/profile/${worker.worker_id}`)}
                          sx={{
                            textDecoration: 'none',
                            color: theme.palette.primary.main,
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            position: 'relative',
                            display: 'inline-flex',
                            alignItems: 'center',
                            '&:hover': {
                              textDecoration: 'underline',
                              '&::after': {
                                content: '"Go to profile"',
                                position: 'absolute',
                                bottom: '-20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                backgroundColor: theme.palette.grey[800],
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                whiteSpace: 'nowrap',
                                zIndex: 1000,
                                boxShadow: theme.shadows[1]
                              }
                            }
                          }}
                        >
                          {worker.name}
                        </Link>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '1.1rem' }}>{worker.job_title}</TableCell>
                    {!isMobile && !isTablet && <TableCell sx={{ fontSize: '1.1rem' }}>{worker.city || 'N/A'}</TableCell>}
                    {!isMobile && !isTablet && <TableCell sx={{ fontSize: '1.1rem' }}>{worker.age || 'N/A'}</TableCell>}
                    {!isMobile && <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneOutlinedIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.text.secondary }} />
                        <Typography sx={{ fontSize: '1.1rem' }}>{worker.phone || 'N/A'}</Typography>
                      </Box>
                    </TableCell>}
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
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.9rem' }}>
                            No ratings yet
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.9rem' }}>
                            {worker.rating?.toFixed(1) || '0.0'} ({worker.rating_count})
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={worker.status} 
                        color={getWorkerStatusColor(worker.status)} 
                        size="small"
                        variant={worker.status === 'PENDING' ? 'outlined' : 'filled'}
                        icon={getWorkerStatusIcon(worker.status)}
                        sx={{ fontWeight: 500, fontSize: '0.9rem' }}
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
                                  px: 1.5,
                                  fontSize: '1rem'
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
                                  px: 1.5,
                                  fontSize: '1rem'
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
                                borderRadius: 1.5,
                                fontSize: '1rem'
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
                              sx={{ fontSize: '0.9rem' }}
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                    )}
                    <TableCell sx={{ minWidth: isMobile ? '110px' : '140px' }}>
                      <Tooltip title="Rate and review this worker">
                        <Button
                          variant="outlined"
                          size="small"
                          color="secondary"
                          startIcon={<RateReviewIcon />}
                          onClick={() => handleOpenRatingModal(worker.worker_id, worker.name, worker.job_title)}
                          sx={{
                            textTransform: 'none',
                            borderRadius: 1.5,
                            fontSize: '1rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {isMobile ? 'Rate' : 'Rate&Review'}
                        </Button>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {worker.approval_status === false && worker.approval_count === 0 ? (
                        <Tooltip title="Not yet time to confirm arrival">
                          <Chip 
                            label="Not yet required" 
                            color="default"
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                          />
                        </Tooltip>
                      ) : worker.approval_status === false && (worker.approval_count || 0) > 0 ? (
                        <Tooltip title="Worker declined attendance">
                          <Chip 
                            icon={<CancelIcon />}
                            label="Declined" 
                            color="error"
                            size="small"
                            sx={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                          />
                        </Tooltip>
                      ) : worker.approval_status === true && worker.approval_count === 1 ? (
                        <Tooltip title="Worker confirmed arrival for day before">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <VerifiedIcon color="success" sx={{ mr: 0.5 }} fontSize="small" />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                              Day before
                            </Typography>
                          </Box>
                        </Tooltip>
                      ) : worker.approval_status === true && worker.approval_count === 2 ? (
                        <Tooltip title="Worker fully confirmed arrival (day before and day of)">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <VerifiedIcon color="success" sx={{ mr: 0.5 }} fontSize="small" />
                            <VerifiedIcon color="success" fontSize="small" />
                          </Box>
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Unknown
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell 
                    colSpan={
                      (() => {
                        let colCount = 6; // Base columns always shown
                        if (!isMobile && !isTablet) colCount += 2; // City and Age
                        if (!isMobile) colCount += 1; // Phone
                        if (isHrManager) colCount += 1; // Actions
                        return colCount;
                      })()
                    } 
                    align="center"
                    sx={{ py: 4 }}
                  >
                    <Typography color="text.secondary" sx={{ fontSize: '1.2rem' }}>
                      No workers assigned to this event
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </TableContainer>
    </>
  );
};

return (
  <Container 
    maxWidth="xl" 
    sx={{ 
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
);
};

export default EventPage;