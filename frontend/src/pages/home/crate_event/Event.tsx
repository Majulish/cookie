import React from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Dayjs } from "dayjs";

interface EventProps {
  event: {
    event_name: string;
    event_description: string;
    start_date: Dayjs; // Dayjs object for start date
    end_date: Dayjs;   // Dayjs object for end date
    location: string;
    jobs: Record<string, number>;
  };
}

const Event: React.FC<EventProps> = ({ event }) => (
  <Accordion>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="h6">{event.event_name}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Typography>{event.event_description}</Typography>
      <Typography variant="body2">
        Start: {event.start_date.format("DD/MM/YYYY HH:mm")}
      </Typography>
      <Typography variant="body2">
        End: {event.end_date.format("DD/MM/YYYY HH:mm")}
      </Typography>
    </AccordionDetails>
  </Accordion>
);

export default Event;
