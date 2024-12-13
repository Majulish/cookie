import React from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {  MyEventScheme } from "../create_event/eventScheme";

interface EventProps {
  event: MyEventScheme;
}

const MyEvent: React.FC<EventProps> = ({ event }) => (
  <Accordion>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="h6">{event.name}</Typography>
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
);

export default MyEvent;