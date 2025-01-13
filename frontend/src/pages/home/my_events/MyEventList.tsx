import React from "react";
import { Box, Typography } from "@mui/material";
import Event from "./MyEvent";
import { MyEventScheme } from "../create_event/eventScheme";
import { EventFormInputs } from "../create_event/eventScheme";
import useUserRole from '../hooks/useUserRole';

interface EventListProps {
  events: MyEventScheme[];
  onEventUpdate: (eventId: number, data: EventFormInputs) => Promise<boolean>;
  onEventDelete: (eventId: number) => Promise<boolean>;
}

const MyEventList: React.FC<EventListProps> = ({ events, onEventUpdate, onEventDelete }) => {
  const userRole = useUserRole();
  const hasAccessToPastEvents = userRole !== 'worker';

  const parseDateString = (dateStr: string, timeStr: string): Date => {
    const [day, month, year] = dateStr.split('/');
    const time = timeStr || '00:00';
    return new Date(`${month}/${day}/${year} ${time}`);
  };

  const getPastWeekEvents = (events: MyEventScheme[]): MyEventScheme[] => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return events.filter(event => {
      try {
        const eventStartDate = parseDateString(event.start_date, event.start_time);
        return eventStartDate >= oneWeekAgo && eventStartDate <= now;
      } catch (error) {
        console.error('Error parsing date:', error);
        return false;
      }
    });
  };

  const pastWeekEvents = getPastWeekEvents(events);
  const currentEvents = events.filter(event => !pastWeekEvents.includes(event));

  return (
    <Box>
      {/* Current Events */}
      <Box sx={{ padding: 2 }}>
        {currentEvents.map((event) => (
          <Event 
            key={event.id} 
            event={event}
            onEventUpdate={onEventUpdate}
            onEventDelete={onEventDelete}
            isPastWeekEvent={false}
          />
        ))}
      </Box>

      {/* Past Week Events Section */}
      {pastWeekEvents.length > 0 && hasAccessToPastEvents && (
        <Box mt={8}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Last Week Events
          </Typography>
          <Box sx={{ padding: 2 }}>
            {pastWeekEvents.map((event) => (
              <Event 
                key={event.id} 
                event={event}
                onEventUpdate={onEventUpdate}
                onEventDelete={onEventDelete}
                isPastWeekEvent={true}  // Set to true for past week events
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MyEventList;