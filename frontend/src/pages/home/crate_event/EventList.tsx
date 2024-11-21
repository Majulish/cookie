import React from "react";
import { Box } from "@mui/material";
import Event from "./Event";
import { EventFormInputs } from "./eventScheme";
import dayjs from "dayjs";

interface EventListProps {
  events: EventFormInputs[]; 
}

const EventList: React.FC<EventListProps> = ({ events }) => (
  <Box sx={{ padding: 2 }}>
    {events.map((event, index) => (
      <Event key={index} event={{
        ...event,
        start_date: dayjs(event.start_date),
        end_date: dayjs(event.end_date),
      }} />
    ))}
  </Box>
);

export default EventList;
