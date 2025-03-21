import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  IconButton, 
  Button,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Tooltip,
  Badge
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { getMyEvents } from '../../api/eventApi';
import { MyEventScheme } from '../home/create_event/eventScheme';
import useUserRole from '../home/hooks/useUserRole';

// Type for our calendar cell
interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
  events: MyEventScheme[];
}

interface CalendarProps {
  onEventClick?: (event: MyEventScheme) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onEventClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const userRole = useUserRole();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarCells, setCalendarCells] = useState<CalendarCell[]>([]);
  const [events, setEvents] = useState<MyEventScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format a date to "14" (just the day number)
  const formatDay = (date: Date): string => {
    return date.getDate().toString();
  };

  // Day names and month names for our calendar
  const dayNames = isMobile ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] : 
                     ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper function to parse a date in DD/MM/YYYY format
  const parseFormattedDate = useCallback((dateString: string): Date => {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  }, []);

  // Check if two dates are the same (ignoring time)
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Function to navigate to previous month
  const gotoPrevMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  // Function to navigate to next month
  const gotoNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Function to go to today
  const gotoToday = () => {
    setCurrentDate(new Date());
  };

  // Handle event click
  const handleEventClick = (event: MyEventScheme) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  // Handle day cell click - will show the first event if there are any
  const handleDayCellClick = (cell: CalendarCell) => {
    if (cell.events.length > 0 && onEventClick) {
      onEventClick(cell.events[0]);
    }
  };

  // Get all events from the API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const myEvents = await getMyEvents();
        setEvents(myEvents);
        setError(null);
      } catch (err) {
        setError('Failed to fetch events. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Generate calendar cells when month changes or events are loaded
  useEffect(() => {
    if (loading) return;

    const generateCalendarCells = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // First day of the month
      const firstDayOfMonth = new Date(year, month, 1);
      // Last day of the month
      const lastDayOfMonth = new Date(year, month + 1, 0);
      
      // Start from the first day of the grid (can be from previous month)
      const firstDayOfGrid = new Date(firstDayOfMonth);
      firstDayOfGrid.setDate(firstDayOfGrid.getDate() - firstDayOfMonth.getDay());
      
      const cells: CalendarCell[] = [];
      // Number of rows to display (5 or 6 weeks depending on the month)
      const totalDays = 42; // Always show 6 weeks
      
      // Generate the grid cells
      for (let i = 0; i < totalDays; i++) {
        const cellDate = new Date(firstDayOfGrid);
        cellDate.setDate(firstDayOfGrid.getDate() + i);
        
        // Get events for this date
        const cellEvents = events.filter(event => {
          const eventStartDate = parseFormattedDate(event.start_date);
          return isSameDay(eventStartDate, cellDate);
        });
        
        cells.push({
          date: cellDate,
          isCurrentMonth: cellDate.getMonth() === month,
          events: cellEvents
        });
      }
      
      setCalendarCells(cells);
    };

    generateCalendarCells();
  }, [currentDate, events, loading, parseFormattedDate]);

  // Get number of events to display and if there are more
  const getVisibleEvents = (cell: CalendarCell) => {
    const maxVisible = isMobile ? 1 : isTablet ? 2 : 3;
    const visibleEvents = cell.events.slice(0, maxVisible);
    const hasMore = cell.events.length > maxVisible;
    return { visibleEvents, hasMore, totalCount: cell.events.length };
  };
  
  // Function to determine if a day is today
  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  // Function to determine event color based on worker status and name
  const getEventColor = (event: MyEventScheme) => {
    // Handle worker status colors if applicable
    if (userRole === 'worker' && event.worker_status) {
      if (event.worker_status === 'PENDING') {
        return theme.palette.warning.main;
      }
      if (event.worker_status === 'APPROVED') {
        return theme.palette.success.main;
      }
      if (event.worker_status === 'REJECTED') {
        return theme.palette.error.main;
      }
    }
    
    // Default event colors (consistent based on event name)
    const colorOptions = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      '#3f51b5', // indigo
      '#9c27b0', // purple
      '#00796b', // teal
      '#e65100', // orange
      '#1976d2'  // blue
    ];
    
    // Use a hash of the event name to get a consistent color
    const hash = event.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colorOptions[hash % colorOptions.length];
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Calendar Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          gap: 1
        }}
      >
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          sx={{ 
            fontWeight: 600,
            flex: { xs: '1 0 100%', sm: '1 0 auto' },
            mb: { xs: 1, sm: 0 },
            order: { xs: 1, sm: 1 }
          }}
        >
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Typography>
        
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            order: { xs: 3, sm: 2 },
            flex: { xs: '1 0 auto', sm: '0 0 auto' }
          }}
        >
          <Button 
            variant="outlined" 
            size="small" 
            onClick={gotoToday}
            startIcon={<TodayIcon />}
            sx={{ mr: 2, display: { xs: 'none', sm: 'flex' } }}
          >
            Today
          </Button>
          <IconButton onClick={gotoToday} size="small" sx={{ display: { xs: 'flex', sm: 'none' }, mr: 1 }}>
            <TodayIcon />
          </IconButton>
          
          <IconButton onClick={gotoPrevMonth} size="small">
            <ChevronLeftIcon />
          </IconButton>
          
          <IconButton onClick={gotoNextMonth} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', p: 4, color: 'error.main' }}>
          <Typography>{error}</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }} 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Box>
      ) : (
        <>
          {/* Day Headers */}
          <Grid container spacing={1} sx={{ mb: 1 }}>
            {dayNames.map((day, index: number) => (
              <Grid 
                item 
                key={index} 
                xs={12/7}
              >
                <Typography 
                  variant="subtitle2" 
                  align="center"
                  sx={{ 
                    fontWeight: 600,
                    color: index === 0 || index === 6 ? 'text.secondary' : 'text.primary',
                    py: 1,
                    backgroundColor: theme.palette.background.default,
                    borderRadius: 1,
                  }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Calendar Grid */}
          <Grid container spacing={1}>
            {calendarCells.map((cell: CalendarCell, index: number) => {
              const { visibleEvents, hasMore, totalCount } = getVisibleEvents(cell);
              const todayCell = isToday(cell.date);
              
              // Calculate background color for cell
              let bgColor = theme.palette.background.paper;
              
              if (!cell.isCurrentMonth) {
                bgColor = theme.palette.background.default;
              } else if (todayCell) {
                bgColor = 'rgba(21, 101, 192, 0.15)';
              } else if (cell.events.length > 0) {
                // For event days, use light blue background that stands out
                bgColor = 'rgba(25, 118, 210, 0.08)';
                
                // Try to apply a custom color based on event if possible
                try {
                  const baseColor = getEventColor(cell.events[0]);
                  
                  if (baseColor.startsWith('#')) {
                    // Remove # and convert to RGB
                    const hex = baseColor.slice(1);
                    const r = parseInt(hex.substring(0, 2), 16);
                    const g = parseInt(hex.substring(2, 4), 16);
                    const b = parseInt(hex.substring(4, 6), 16);
                    
                    // Use a light opacity version of the event color
                    const opacity = 0.12 + Math.min(cell.events.length * 0.02, 0.08);
                    bgColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                  }
                } catch (e) {
                  // Keep default light blue if color extraction fails
                }
              }
              
              return (
                <Grid item xs={12/7} key={index}>
                  <Paper 
                    elevation={0}
                    onClick={() => cell.isCurrentMonth && handleDayCellClick(cell)}
                    sx={{ 
                      p: 1,
                      minHeight: { xs: 90, sm: 120 },
                      backgroundColor: bgColor,
                      border: todayCell 
                        ? `2px solid ${theme.palette.primary.main}` 
                        : cell.events.length > 0 && cell.isCurrentMonth
                          ? `1px solid ${theme.palette.primary.main}33` 
                          : '1px solid transparent',
                      borderRadius: 1,
                      position: 'relative',
                      transition: 'all 0.2s ease-in-out',
                      cursor: cell.events.length > 0 && cell.isCurrentMonth ? 'pointer' : 'default',
                      '&:hover': cell.isCurrentMonth ? {
                        boxShadow: cell.events.length > 0 
                          ? '0 4px 8px rgba(0,0,0,0.1)' 
                          : '0 2px 4px rgba(0,0,0,0.05)',
                        transform: 'translateY(-2px)',
                      } : {},
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Event count badge */}
                    {cell.events.length > 0 && cell.isCurrentMonth && (
                      <Badge 
                        badgeContent={cell.events.length} 
                        color="primary"
                        max={99}
                        sx={{ 
                          position: 'absolute',
                          top: 4,
                          right: 4,
                        }}
                      />
                    )}
                    
                    {/* Date display */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center',
                      mb: 0.75 
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: todayCell ? 700 : cell.isCurrentMonth ? 500 : 400,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: todayCell ? theme.palette.primary.main : 'transparent',
                          color: todayCell 
                            ? theme.palette.primary.contrastText 
                            : !cell.isCurrentMonth 
                              ? 'text.secondary' 
                              : 'text.primary'
                        }}
                      >
                        {formatDay(cell.date)}
                      </Typography>
                    </Box>
                    
                    {/* Event items */}
                    <Box sx={{ 
                      flex: 1,
                      overflow: 'hidden', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 0.5 
                    }}>
                      {visibleEvents.map((event: MyEventScheme, eventIndex: number) => (
                        <Tooltip 
                          key={eventIndex} 
                          title={event.name} 
                          arrow
                          placement="top"
                        >
                          <Box 
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation(); // Prevent triggering parent click
                              handleEventClick(event);
                            }}
                            sx={{
                              backgroundColor: getEventColor(event),
                              color: 'white',
                              borderRadius: 1,
                              px: 1,
                              py: 0.5,
                              fontSize: '0.75rem',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: theme.palette.mode === 'light' 
                                  ? `${getEventColor(event)}dd` 
                                  : `${getEventColor(event)}aa`,
                                transform: 'translateY(-2px)',
                                boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
                              },
                              transition: 'all 0.2s ease-in-out',
                            }}
                          >
                            {event.name}
                          </Box>
                        </Tooltip>
                      ))}
                      
                      {/* "More" indicator if there are hidden events */}
                      {hasMore && (
                        <Box 
                          sx={{
                            px: 1,
                            py: 0.25,
                            fontSize: '0.7rem',
                            color: 'text.secondary',
                            fontWeight: 500,
                            textAlign: 'center',
                            cursor: 'pointer',
                            borderRadius: 1,
                            backgroundColor: 'rgba(0,0,0,0.04)',
                            '&:hover': {
                              backgroundColor: 'rgba(0,0,0,0.08)',
                              color: 'text.primary',
                            }
                          }}
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation(); // Prevent triggering parent click
                            // Show all events for this day - this could open a modal or expand the cell
                            // For now, let's just click the first hidden event
                            if (cell.events.length > visibleEvents.length) {
                              handleEventClick(cell.events[visibleEvents.length]);
                            }
                          }}
                        >
                          +{totalCount - visibleEvents.length} more
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Calendar;