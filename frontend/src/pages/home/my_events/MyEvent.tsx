import React, { useState } from "react";
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Link,
  Box,
  Badge,
  Paper,
  Chip,
  Grid,
  Divider
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PendingIcon from "@mui/icons-material/Pending";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import { MyEventScheme } from "../create_event/eventScheme";
import NewEventDialog from "../create_event/NewEventModal";
import { EventFormInputs } from "../create_event/eventScheme";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import DeleteSuccessModal from "../../../components/DeleteSuccessModal";
import useUserRole from '../hooks/useUserRole';

interface EventProps {
  event: MyEventScheme;
  onEventUpdate: (eventId: number, data: EventFormInputs) => Promise<boolean>;
  onEventDelete: (eventId: number) => Promise<boolean>;
  isPastWeekEvent?: boolean;  
}

const MyEvent: React.FC<EventProps> = ({ 
  event, 
  onEventUpdate, 
  onEventDelete,
  isPastWeekEvent = false  
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteSuccessOpen, setIsDeleteSuccessOpen] = useState(false);
  const open = Boolean(anchorEl);
  const userRole = useUserRole();
  
  const hasEditPermission = userRole !== 'worker';
  const isWorker = userRole === 'worker';

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const handleEditClick = (event: React.MouseEvent<HTMLElement>) => {
    handleClose(event);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (event: React.MouseEvent<HTMLElement>) => {
    handleClose(event);
    setIsDeleteConfirmOpen(true);
  };

  const handleRateWorkersClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Rate workers clicked for event:', event.id);
  };

  const handleConfirmDelete = async () => {
    const success = await onEventDelete(event.id);
    setIsDeleteConfirmOpen(false);
    if (success) {
      setIsDeleteSuccessOpen(true);
    }
  };

  const handleEditSubmit = async (data: EventFormInputs) => {
    return onEventUpdate(event.id, data);
  };

  // MODIFIED: We're removing stopPropagation here
  // This function is only needed if we have any special handling for name clicks
  const handleEventNameClick = (e: React.MouseEvent) => {
    // No need to stop propagation anymore - we want the click to reach the accordion
    // but we also want the link to work
  };

  // Check for exact string values of worker_status
  const pendingStatus = "PENDING";
  const waitingListStatus = "WAITING_LIST";
  
  // Use for styling decisions
  const hasPendingStatus = event.worker_status === pendingStatus;
  const hasWaitingListStatus = event.worker_status === waitingListStatus;

  // Format dates for display
  const formatDate = (dateStr: string, timeStr: string) => {
    try {
      const [day, month, year] = dateStr.split('/');
      const date = new Date(`${month}/${day}/${year}`);
      
      // Format date as "Mon, Jan 15, 2023"
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      return `${formattedDate} at ${timeStr}`;
    } catch (error) {
      return `${dateStr} ${timeStr}`;
    }
  };

  return (
    <>
      <Paper 
        elevation={2} 
        sx={{ 
          mb: 2,
          borderRadius: '8px',
          borderLeft: hasPendingStatus ? '5px solid #FF9800' : 
                     hasWaitingListStatus ? '5px solid #2196F3' : '5px solid #4CAF50',
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3
          }
        }}
      >
        <Accordion 
          sx={{ 
            boxShadow: 'none',
            '&:before': {
              display: 'none'
            }
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{
              '& .MuiAccordionSummary-content': {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mr: 2
              },
              minHeight: '72px',
              py: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                {/* Status chips */}
                <Box sx={{ display: 'flex', mb: 1, gap: 1 }}>
                  {hasPendingStatus && (
                    <Chip
                      icon={<PendingIcon />}
                      label="PENDING"
                      size="small"
                      sx={{ 
                        bgcolor: '#FFF3E0', 
                        color: '#E65100',
                        fontWeight: 600,
                        '& .MuiChip-icon': { color: '#FF9800' }
                      }}
                    />
                  )}
                  
                  {hasWaitingListStatus && (
                    <Chip
                      icon={<WatchLaterIcon />}
                      label="WAITING LIST"
                      size="small"
                      sx={{ 
                        bgcolor: '#E3F2FD', 
                        color: '#0D47A1',
                        fontWeight: 600,
                        '& .MuiChip-icon': { color: '#2196F3' }
                      }}
                    />
                  )}
                </Box>
                
                {/* Event name */}
                {isWorker ? (
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      lineHeight: 1.2
                    }}
                  >
                    {event.name}
                  </Typography>
                ) : (
                  <Link
                    component={RouterLink}
                    to={`/event-page/${event.id}`}
                    onClick={(e) => {
                      // Stop propagation ONLY for the link click
                      // This ensures the accordion doesn't toggle when the link is clicked
                      e.stopPropagation();
                    }}
                    sx={{
                      textDecoration: 'none',
                      color: 'primary.main',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        lineHeight: 1.2
                      }}
                    >
                      {event.name}
                    </Typography>
                  </Link>
                )}
                
                {/* Date preview */}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <CalendarTodayIcon 
                    sx={{ 
                      fontSize: '0.875rem', 
                      color: 'text.secondary',
                      mr: 0.5
                    }} 
                  />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {formatDate(event.start_date, event.start_time)}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isPastWeekEvent && hasEditPermission && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<StarIcon />}
                    onClick={handleRateWorkersClick}
                    sx={{
                      bgcolor: '#FFC107',
                      '&:hover': {
                        bgcolor: '#FFA000',
                      },
                      color: 'rgba(0,0,0,0.87)',
                      fontWeight: 600,
                      px: 2
                    }}
                  >
                    Rate Workers
                  </Button>
                )}
                {hasEditPermission && (
                  <>
                    <IconButton
                      aria-label="more"
                      aria-controls={open ? 'event-menu' : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? 'true' : undefined}
                      onClick={handleClick}
                      sx={{ 
                        color: 'text.secondary',
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      id="event-menu"
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                      onClick={handleClose}
                      PaperProps={{
                        elevation: 3,
                        sx: { borderRadius: 2, minWidth: 150 }
                      }}
                    >
                      <MenuItem onClick={handleEditClick} dense>
                        <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
                        Edit
                      </MenuItem>
                      <MenuItem onClick={handleDeleteClick} dense>
                        <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
                        Delete
                      </MenuItem>
                    </Menu>
                  </>
                )}
              </Box>
            </Box>
          </AccordionSummary>
          
          <AccordionDetails sx={{ py: 2, px: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Event Time
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <AccessTimeIcon 
                      sx={{ 
                        color: 'primary.main', 
                        mr: 1,
                        mt: 0.5,
                        fontSize: '1.25rem'
                      }} 
                    />
                    <Box>
                      <Typography variant="body2">
                        <strong>Start:</strong> {formatDate(event.start_date, event.start_time)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>End:</strong> {formatDate(event.end_date, event.end_time)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Location
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <LocationOnIcon 
                      sx={{ 
                        color: 'primary.main', 
                        mr: 1,
                        mt: 0.5,
                        fontSize: '1.25rem'
                      }} 
                    />
                    <Typography variant="body2">
                      {event.address}, {event.city}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              {(hasPendingStatus || hasWaitingListStatus) && (
                <Grid item xs={12}>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 1, 
                      bgcolor: hasPendingStatus ? '#FFF3E0' : '#E3F2FD',
                      display: 'flex',
                      alignItems: 'center',
                      mt: 1
                    }}
                  >
                    {hasPendingStatus ? (
                      <PendingIcon sx={{ color: '#FF9800', mr: 1 }} />
                    ) : (
                      <WatchLaterIcon sx={{ color: '#2196F3', mr: 1 }} />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'medium',
                        color: hasPendingStatus ? '#E65100' : '#0D47A1'
                      }}
                    >
                      {hasPendingStatus 
                        ? 'Your application is pending approval. We\'ll notify you once it\'s reviewed.'
                        : 'You\'re on the waiting list. We\'ll notify you if a spot becomes available.'}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {event.description}
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {hasEditPermission && (
        <>
          <NewEventDialog
            open={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleEditSubmit}
            mode="edit"
            eventData={event}
          />

          <DeleteConfirmationModal
            open={isDeleteConfirmOpen}
            onClose={() => setIsDeleteConfirmOpen(false)}
            onConfirm={handleConfirmDelete}
            eventName={event.name}
          />

          <DeleteSuccessModal
            open={isDeleteSuccessOpen}
            onClose={() => setIsDeleteSuccessOpen(false)}
          />
        </>
      )}
    </>
  );
};

export default MyEvent;