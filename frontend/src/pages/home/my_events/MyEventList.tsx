// MyEventList.tsx
import React, { useEffect } from "react";
import { Box, Typography, Paper, useTheme, useMediaQuery } from "@mui/material";
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
          fontSize: '1.2rem'
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

  // Helper to format date in DD/MM/YYYY
  const formatDateString = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Improved date parsing function
  const parseDateString = (dateStr: string, timeStr: string): Date => {
    try {
      // Handle DD/MM/YYYY format properly
      const [day, month, year] = dateStr.split('/').map(Number);
      const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);
      
      // Create date using individual components to avoid browser inconsistencies
      const date = new Date();
      date.setFullYear(year);
      date.setMonth(month - 1); // Month is 0-indexed in JavaScript
      date.setDate(day);
      date.setHours(hours);
      date.setMinutes(minutes);
      date.setSeconds(0);
      date.setMilliseconds(0);
      
      return date;
    } catch (error) {
      console.error('Error parsing date:', dateStr, timeStr, error);
      // Return current date as fallback
      return new Date();
    }
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
    
    // Create today date string in DD/MM/YYYY format for direct comparison
    const todayDateString = formatDateString(now);
    
    // Create beginning and end of today for time-based comparisons
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    return events.filter(event => {
      try {
        // First, check for direct date string match (most reliable)
        const isToday = event.start_date === todayDateString;
        
        // As backup, also check with proper date parsing
        const eventStartDate = parseDateString(event.start_date, event.start_time);
        const eventEndDate = parseDateString(event.end_date, event.end_time);
        
        // Check if event starts today
        const startsToday = eventStartDate >= todayStart && eventStartDate <= todayEnd;
        
        // Check if event is ongoing (started before but still happening)
        const isOngoing = eventStartDate < todayStart && eventEndDate >= todayStart;
        
        return isToday || startsToday || isOngoing;
      } catch (error) {
        console.error('Error processing event:', event, error);
        return false;
      }
    });
  };

  const getUpcomingEvents = (allEvents: MyEventScheme[], todayEvents: MyEventScheme[], pastEvents: MyEventScheme[]): MyEventScheme[] => {
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    // Create a Set of IDs for quick lookup
    const todayEventIds = new Set(todayEvents.map(e => e.id));
    const pastEventIds = new Set(pastEvents.map(e => e.id));
    
    return allEvents.filter(event => {
      // Skip events already in today or past events
      if (todayEventIds.has(event.id) || pastEventIds.has(event.id)) {
        return false;
      }
      
      try {
        const eventStartDate = parseDateString(event.start_date, event.start_time);
        // An event is upcoming if it starts after today
        return eventStartDate > todayEnd;
      } catch (error) {
        console.error('Error parsing date for upcoming check:', error);
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

  // Add debugging effect
  useEffect(() => {
    console.log("Events received:", events);
    
    const now = new Date();
    const todayString = formatDateString(now);
    console.log("Today's date (formatted):", todayString);
    
    // Check which events match today's date
    events.forEach(event => {
      console.log(
        `Event: ${event.name}, Date: ${event.start_date}, Is Today: ${event.start_date === todayString}`
      );
    });
  }, [events]);

  // Process events
  const pastWeekEvents = getPastWeekEvents(events);
  const todayEvents = getTodayEvents(events);
  const upcomingEvents = sortEventsByDate(getUpcomingEvents(events, todayEvents, pastWeekEvents));
  
  // Additional debugging logs
  console.log("Found today events:", todayEvents.length);
  console.log("Found upcoming events:", upcomingEvents.length);
  console.log("Found past week events:", pastWeekEvents.length);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Today's Events Section */}
      <Box>
        <SectionHeader 
          title="Today's Events" 
          icon={<TodayIcon fontSize="large" />} 
          count={todayEvents.length}
        />
        
        {todayEvents.length === 0 ? (
          <NoEventsMessage message="No events scheduled for today" />
        ) : (
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
        )}
      </Box>
      
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

      {/* Past Week Events Section - Only for non-workers */}
      {hasAccessToPastEvents && (
        <Box>
          <SectionHeader 
            title="Past Week Events" 
            icon={<HistoryIcon fontSize="large" />} 
            count={pastWeekEvents.length}
          />
          
          {pastWeekEvents.length === 0 ? (
            <NoEventsMessage message="No events in the past week" />
          ) : (
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
          )}
        </Box>
      )}
    </Box>
  );
};

export default MyEventList;