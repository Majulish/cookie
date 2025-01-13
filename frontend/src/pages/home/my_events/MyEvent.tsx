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

interface EventProps {
  event: MyEventScheme;
  onEventUpdate: (eventId: number, data: EventFormInputs) => Promise<boolean>;
}

const MyEvent: React.FC<EventProps> = ({ event, onEventUpdate }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const open = Boolean(anchorEl);

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
            <MenuItem onClick={handleClose}>Delete</MenuItem>
          </Menu>
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

      <NewEventDialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        mode="edit"
        eventData={event}
      />
    </>
  );
};

export default MyEvent;