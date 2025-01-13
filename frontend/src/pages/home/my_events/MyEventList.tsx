import React from "react";
import { Box } from "@mui/material";
import Event from "./MyEvent";
import { MyEventScheme } from "../create_event/eventScheme";
import { EventFormInputs } from "../create_event/eventScheme";

interface EventListProps {
  events: MyEventScheme[];
  onEventUpdate: (eventId: number, data: EventFormInputs) => Promise<boolean>;
  onEventDelete: (eventId: number) => Promise<boolean>;
}

const MyEventList: React.FC<EventListProps> = ({ events, onEventUpdate, onEventDelete }) => (
  <Box sx={{ padding: 2 }}>
    {events.map((event, index) => (
      <Event 
        key={index} 
        event={event}
        onEventUpdate={onEventUpdate}
        onEventDelete={onEventDelete}
      />
    ))}
  </Box>
);

export default MyEventList;