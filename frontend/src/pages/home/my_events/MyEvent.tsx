import React, { useState } from "react";
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Typography,
  IconButton,
  Menu,
  MenuItem
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { MyEventScheme } from "../create_event/eventScheme";
import NewEventDialog from "../create_event/NewEventModal";
import { EventFormInputs } from "../create_event/eventScheme";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import DeleteSuccessModal from "../../../components/DeleteSuccessModal";
import  useUserRole from '../hooks/useUserRole'; 

interface EventProps {
  event: MyEventScheme;
  onEventUpdate: (eventId: number, data: EventFormInputs) => Promise<boolean>;
  onEventDelete: (eventId: number) => Promise<boolean>;
}

const MyEvent: React.FC<EventProps> = ({ event, onEventUpdate, onEventDelete }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteSuccessOpen, setIsDeleteSuccessOpen] = useState(false);
  const open = Boolean(anchorEl);
  const userRole = useUserRole();
  
  // Check if user has permission to edit/delete
  const hasEditPermission = userRole !== 'worker';

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

  return (
    <>
      <Accordion>
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
          <Typography variant="h6">{event.name}</Typography>
          {hasEditPermission && (
            <>
              <IconButton
                aria-label="more"
                aria-controls={open ? 'event-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                sx={{ ml: 2 }}
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
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            Start: {event.start_date} {event.start_time}
            <br />
            End: {event.end_date} {event.end_time}
            <br />
            Location: {event.location}
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