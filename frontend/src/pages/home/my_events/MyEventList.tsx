// MyEventList.tsx
import React from "react";
import { Box, Typography, Paper, Divider, useTheme, useMediaQuery } from "@mui/material";
import Event from "./MyEvent";
import { MyEventScheme } from "../create_event/eventScheme";
import { EventFormInputs } from "../create_event/eventScheme";
import useUserRole from '../hooks/useUserRole';
import EventIcon from '@mui/icons-material/Event';
import HistoryIcon from '@mui/icons-material/History';
import TodayIcon from '@mui/icons-material/Today';

interface EventListProps {
  events: MyEventScheme[];
  onEventUpdate: (eventId: number, data: EventFormInputs) => Promise<boolean>;
  onEventDelete: (eventId: number) => Promise<boolean>;
}

const SectionHeader: React.FC<{ 
  title: string; 
  icon: React.ReactNode;
  count: number;
}> = ({ title, icon, count }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 3,
        pb: 1,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: '8px',
          p: 1,
          mr: 2
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="h2" fontWeight={600} sx={{ fontSize: '1.7rem' }}>
          {title}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          color: 'grey.700',
          borderRadius: '16px',
          px: 1.5,
          py: 0.5,
          fontWeight: 'medium',
          fontSize: '1.2rem'  // Increased from 1rem
        }}
      >
        {count} {count === 1 ? 'Event' : 'Events'}
      </Box>
    </Box>
  );
};

const NoEventsMessage: React.FC<{ message: string }> = ({ message }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      textAlign: 'center',
      borderRadius: 2,
      bgcolor: 'grey.50',
      border: '1px dashed',
      borderColor: 'grey.300'
    }}
  >
    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.2rem' }}>
      {message}
    </Typography>
  </Paper>
);

const MyEventList: React.FC<EventListProps> = ({ events, onEventUpdate, onEventDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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

  const getTodayEvents = (events: MyEventScheme[]): MyEventScheme[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return events.filter(event => {
      try {
        const eventStartDate = parseDateString(event.start_date, event.start_time);
        const eventEndDate = parseDateString(event.end_date, event.end_time);
        
        // Check if event starts today or if it's ongoing (started before but hasn't ended yet)
        const startsToday = eventStartDate.getDate() === today.getDate() &&
                           eventStartDate.getMonth() === today.getMonth() &&
                           eventStartDate.getFullYear() === today.getFullYear();
        
        const isOngoing = eventStartDate <= now && eventEndDate >= now;
        
        return startsToday || isOngoing;
      } catch (error) {
        console.error('Error parsing date:', error);
        return false;
      }
    });
  };

  const sortEventsByDate = (events: MyEventScheme[]): MyEventScheme[] => {
    return [...events].sort((a, b) => {
      try {
        const dateA = parseDateString(a.start_date, a.start_time);
        const dateB = parseDateString(b.start_date, b.start_time);
        return dateA.getTime() - dateB.getTime();
      } catch (error) {
        return 0;
      }
    });
  };

  const pastWeekEvents = getPastWeekEvents(events);
  const todayEvents = getTodayEvents(events);
  
  // Filter and sort upcoming events
  const upcomingEvents = sortEventsByDate(
    events.filter(event => 
      !pastWeekEvents.includes(event) && !todayEvents.includes(event)
    )
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Upcoming Events Section */}
      <Box>
        <SectionHeader 
          title="Upcoming Events" 
          icon={<EventIcon fontSize="large" />} 
          count={upcomingEvents.length}
        />
        
        {upcomingEvents.length === 0 ? (
          <NoEventsMessage message="No upcoming events scheduled" />
        ) : (
          <Box sx={{ px: isMobile ? 0 : 1 }}>
            {upcomingEvents.map((event) => (
              <Event 
                key={event.id} 
                event={event}
                onEventUpdate={onEventUpdate}
                onEventDelete={onEventDelete}
                isPastWeekEvent={false}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Today's Events Section - Only for workers */}
      {userRole === 'worker' && todayEvents.length > 0 && (
        <Box>
          <SectionHeader 
            title="Today's Events" 
            icon={<TodayIcon fontSize="large" />} 
            count={todayEvents.length}
          />
          
          <Box sx={{ px: isMobile ? 0 : 1 }}>
            {todayEvents.map((event) => (
              <Event 
                key={event.id} 
                event={event}
                onEventUpdate={onEventUpdate}
                onEventDelete={onEventDelete}
                isPastWeekEvent={false}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Past Week Events Section - Only for non-workers */}
      {pastWeekEvents.length > 0 && hasAccessToPastEvents && (
        <Box>
          <SectionHeader 
            title="Past Week Events" 
            icon={<HistoryIcon fontSize="large" />} 
            count={pastWeekEvents.length}
          />
          
          <Box sx={{ px: isMobile ? 0 : 1 }}>
            {pastWeekEvents.map((event) => (
              <Event 
                key={event.id} 
                event={event}
                onEventUpdate={onEventUpdate}
                onEventDelete={onEventDelete}
                isPastWeekEvent={true}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MyEventList;