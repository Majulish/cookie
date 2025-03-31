import { format } from 'date-fns';
import { useTheme, Theme } from '@mui/material';

type StatusColor = 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'default';

/**
 * Hook that provides utilities for formatting and styling event data
 * @returns Various utility functions for event data
 */
const useEventUtils = () => {
  const theme: Theme = useTheme();

  // Format dates for display
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'PPP'); // Format: Apr 29, 2021
  };
  
  const formatTime = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'p'); // Format: 5:00 PM
  };

  // Get event status style
  const getEventStatusColor = (status: string | undefined): StatusColor => {
    if (!status) return 'default';
    
    switch(status.toLowerCase()) {
      case 'planned': return 'primary';
      case 'ongoing': return 'success';
      case 'completed': return 'secondary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // Get worker status style
  const getWorkerStatusColor = (status: string | undefined): StatusColor => {
    if (!status) return 'default';
    
    switch(status.toUpperCase()) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'BACKUP': return 'info';
      default: return 'default';
    }
  };

  // Get status label with proper capitalization
  const getStatusLabel = (status: string | undefined): string => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return {
    formatDate,
    formatTime,
    getEventStatusColor,
    getWorkerStatusColor,
    getStatusLabel,
    theme
  };
};

export default useEventUtils;