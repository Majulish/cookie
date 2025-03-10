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
  Badge
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PendingIcon from "@mui/icons-material/Pending";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
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

  const handleRateWorkersClick = () => {
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

  // Prevent accordion expansion when clicking on the event name link
  const handleEventNameClick = (e: React.MouseEvent) => {
    if (!isWorker) {
      e.stopPropagation();
    }
  };

  // Check for exact string values of worker_status
  const pendingStatus = "PENDING";
  const waitingListStatus = "WAITING_LIST";
  
  // Use for styling decisions
  const hasPendingStatus = event.worker_status === pendingStatus;
  const hasWaitingListStatus = event.worker_status === waitingListStatus;

  return (
    <>
      <Accordion 
        sx={{ 
          mb: 1,
          border: hasPendingStatus ? '2px solid orange' : 
                 hasWaitingListStatus ? '2px solid blue' : 'none',
          borderRadius: '4px',
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
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {event.worker_status === pendingStatus && (
              <Box 
                sx={{ 
                  bgcolor: 'orange', 
                  color: 'white', 
                  px: 1, 
                  py: 0.5, 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  mr: 1
                }}
              >
                <PendingIcon fontSize="small" />
                PENDING
              </Box>
            )}
            
            {event.worker_status === waitingListStatus && (
              <Box 
                sx={{ 
                  bgcolor: 'blue', 
                  color: 'white', 
                  px: 1, 
                  py: 0.5, 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  mr: 1
                }}
              >
                <WatchLaterIcon fontSize="small" />
                WAITING LIST
              </Box>
            )}
            
            {isWorker ? (
              <Badge
                color={hasPendingStatus ? "warning" : hasWaitingListStatus ? "info" : "default"}
                variant="dot"
                invisible={!hasPendingStatus && !hasWaitingListStatus}
              >
                <Typography variant="h6">{event.name}</Typography>
              </Badge>
            ) : (
              <Badge
                color={hasPendingStatus ? "warning" : hasWaitingListStatus ? "info" : "default"}
                variant="dot"
                invisible={!hasPendingStatus && !hasWaitingListStatus}
              >
                <Link
                  component={RouterLink}
                  to={`/event-page/${event.id}`}
                  onClick={handleEventNameClick}
                  sx={{
                    textDecoration: 'none',
                    color: 'primary.main',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  <Typography variant="h6">{event.name}</Typography>
                </Link>
              </Badge>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isPastWeekEvent && hasEditPermission && (
              <Button
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRateWorkersClick();
                }}
                sx={{
                  backgroundColor: '#FFD700',
                  '&:hover': {
                    backgroundColor: '#FFB700',
                  },
                  color: 'black',
                  mr: 2
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
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  id="event-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  onClick={handleClose}
                >
                  <MenuItem onClick={handleEditClick}>Edit</MenuItem>
                  <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            Start: {event.start_date} {event.start_time}
            <br />
            End: {event.end_date} {event.end_time}
            <br />
            Location: {event.city}, {event.address}
            {hasPendingStatus && (
              <>
                <br />
                <Box component="span" sx={{ color: 'orange', fontWeight: 'bold' }}>
                  Status: PENDING
                </Box>
              </>
            )}
            {hasWaitingListStatus && (
              <>
                <br />
                <Box component="span" sx={{ color: 'blue', fontWeight: 'bold' }}>
                  Status: WAITING LIST
                </Box>
              </>
            )}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Description:
          </Typography>
          <Typography>{event.description}</Typography>
        </AccordionDetails>
      </Accordion>

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