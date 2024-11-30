import React from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {  MyEventScheme } from "../crate_event/eventScheme";

interface EventProps {
  event: MyEventScheme;
}

const MyEvent: React.FC<EventProps> = ({ event }) => (
  <Accordion>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="h6">{event.name}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Typography>{event.description}</Typography>
      <Typography variant="body2">
        Start: {event.start_date} {event.start_time}
      </Typography>
      <Typography variant="body2">
        End: {event.end_date} {event.end_time}
      </Typography>
      <Typography variant="body2">
        Location: {event.location}
      </Typography>
    </AccordionDetails>
  </Accordion>
);

export default MyEvent;