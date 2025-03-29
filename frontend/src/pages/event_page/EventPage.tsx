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

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
            color={getEventStatusColor(event.status)}
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
                  mb: 2
                }}
              >
                <WorkOutlineIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Staffing Overview
              </Typography>
              
              {/* Overall Staffing Progress */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">Overall Staffing Progress</Typography>
                  <Typography variant="subtitle2" fontWeight={500}>
                    {jobStats.filledPositions}/{jobStats.totalOpenings} positions filled
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(jobStats.filledPositions / Math.max(1, jobStats.totalOpenings)) * 100} 
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
                    label={`${jobStats.remainingOpenings} positions remaining`} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                    icon={<GroupIcon fontSize="small" />}
                    sx={{ fontWeight: 500 }}
                  />
                  <Chip 
                    label={`${jobStats.totalSlots} total slots available`} 
                    size="small" 
                    color="default"
                    variant="outlined"
                    icon={<PersonOutlinedIcon fontSize="small" />}
                  />
                </Box>
              </Box>
              
              {/* Jobs Breakdown */}
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Jobs Breakdown
              </Typography>
              <TableContainer component={Paper} sx={{ boxShadow: 'none', mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900] }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Job Title</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Openings</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Slots</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Approved</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Backup</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Pending</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Remaining</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobsWithWorkerCounts.map((job, index) => (
                      <TableRow key={`job-${index}`}>
                        <TableCell sx={{ fontWeight: 500 }}>{job.job_title}</TableCell>
                        <TableCell>{job.openings}</TableCell>
                        <TableCell>{job.slots}</TableCell>
                        <TableCell>
                          <Chip 
                            label={job.workerCounts.approved} 
                            size="small" 
                            color="success"
                            variant={job.workerCounts.approved > 0 ? "filled" : "outlined"}
                            sx={{ minWidth: 60 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={job.workerCounts.backup} 
                            size="small" 
                            color="info"
                            variant={job.workerCounts.backup > 0 ? "filled" : "outlined"}
                            sx={{ minWidth: 60 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={job.workerCounts.pending} 
                            size="small" 
                            color="warning"
                            variant={job.workerCounts.pending > 0 ? "filled" : "outlined"}
                            sx={{ minWidth: 60 }}
                          />
                        </TableCell>
                        <TableCell>
                          {job.remainingOpenings > 0 ? (
                            <Chip 
                              label={job.remainingOpenings} 
                              size="small" 
                              color="primary"
                              sx={{ minWidth: 60 }}
                            />
                          ) : (
                            <Chip 
                              label="Filled" 
                              size="small" 
                              color="success"
                              icon={<CheckCircleOutlineIcon fontSize="small" />}
                              sx={{ minWidth: 60 }}
                            />
                          )}
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
                        color={getWorkerStatusColor(worker.status)} 
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
    <Container 
      maxWidth="lg" 
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