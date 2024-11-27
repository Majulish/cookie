import React from "react";
import { Box } from "@mui/material";
import Event from "./MyEvent";
import { EventFormInputs } from "../crate_event/eventScheme";

interface EventListProps {
  events: EventFormInputs[];
}

const MyEventList: React.FC<EventListProps> = ({ events }) => (
  <Box sx={{ padding: 2 }}>
    {events.map((event, index) => (
      <Event 
        key={index} 
        event={event}  
      />
    ))}
  </Box>
);

export default MyEventList;