import { useState, useEffect } from 'react';
import { getEvent } from '../../../api/eventApi';

// Define interfaces for type safety
interface EventWorker {
  worker_id: number;
  name: string;
  job_title: string;
  status: string;
  city?: string;
  age?: number;
  rating?: number;
  phone: string;
  rating_count?: number;
  approval_status?: boolean;
  approval_count?: number;
}

interface EventJob {
  job_title: string;
  openings: number;
  slots: number;
}

interface DetailedEvent {
  id: number;
  name: string;
  description: string;
  city: string;
  address: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
  workers: EventWorker[];
  jobs: EventJob[];
}

interface WorkerCounts {
  approved: number;
  backup: number;
  pending: number;
}

interface JobStats {
  totalOpenings: number;
  totalSlots: number;
  remainingOpenings: number;
  filledPositions: number;
}

interface JobWithWorkerCounts extends EventJob {
  workerCounts: {
    approved: number;
    backup: number;
    pending: number;
  };
  remainingOpenings: number;
}

/**
 * Hook to fetch and manage event data
 * @param {number | string | undefined} eventId - The ID of the event to fetch
 * @returns Event data, loading state, and utility functions
 */
const useEventData = (eventId: number | string | undefined) => {
  const [event, setEvent] = useState<DetailedEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) {
        setError('Event ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const eventData = await getEvent(Number(eventId));
        setEvent(eventData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch event data');
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  // Sort workers - approved workers first, then backup, then pending
  const sortedWorkers = event?.workers ? [...event.workers].sort((a, b) => {
    if (a.status === 'APPROVED' && b.status !== 'APPROVED') return -1;
    if (a.status !== 'APPROVED' && b.status === 'APPROVED') return 1;
    if (a.status === 'BACKUP' && b.status === 'PENDING') return -1;
    if (a.status === 'PENDING' && b.status === 'BACKUP') return 1;
    return 0;
  }) : [];

  // Count workers by status
  const getWorkerCounts = (): WorkerCounts => {
    if (!event?.workers) return { approved: 0, backup: 0, pending: 0 };
    
    return event.workers.reduce((counts: WorkerCounts, worker) => {
      if (worker.status === 'APPROVED') counts.approved += 1;
      else if (worker.status === 'BACKUP') counts.backup += 1;
      else if (worker.status === 'PENDING') counts.pending += 1;
      return counts;
    }, { approved: 0, backup: 0, pending: 0 });
  };

  // Calculate job statistics including remaining openings
  const calculateJobStats = (): JobStats => {
    if (!event?.jobs || !event?.workers) {
      return {
        totalOpenings: 0,
        totalSlots: 0,
        remainingOpenings: 0,
        filledPositions: 0
      };
    }

    // Count total openings and slots
    const totals = event.jobs.reduce(
      (acc, job) => ({
        totalOpenings: acc.totalOpenings + job.openings,
        totalSlots: acc.totalSlots + job.slots
      }), 
      { totalOpenings: 0, totalSlots: 0 }
    );

    // Count approved workers (filled positions)
    const filledPositions = event.workers.filter(worker => 
      worker.status === 'APPROVED'
    ).length;

    // Calculate remaining openings
    const remainingOpenings = Math.max(0, totals.totalOpenings - filledPositions);

    return {
      ...totals,
      remainingOpenings,
      filledPositions
    };
  };

  // Get worker counts per job title
  const getJobWorkerCounts = (): JobWithWorkerCounts[] => {
    if (!event?.workers || !event?.jobs) return [];
    
    // Count workers by job title and status
    const workersByJob = event.workers.reduce((acc: Record<string, { approved: number, backup: number, pending: number }>, worker) => {
      if (!acc[worker.job_title]) {
        acc[worker.job_title] = { approved: 0, backup: 0, pending: 0 };
      }
      
      if (worker.status === 'APPROVED') acc[worker.job_title].approved += 1;
      else if (worker.status === 'BACKUP') acc[worker.job_title].backup += 1;
      else if (worker.status === 'PENDING') acc[worker.job_title].pending += 1;
      
      return acc;
    }, {});
    
    // Combine job data with worker counts
    return event.jobs.map(job => {
      const counts = workersByJob[job.job_title] || { approved: 0, backup: 0, pending: 0 };
      const remaining = Math.max(0, job.openings - counts.approved);
      
      return {
        ...job,
        workerCounts: counts,
        remainingOpenings: remaining
      };
    });
  };

  // Check if event spans multiple days
  const isMultiDayEvent = (startDate: string | undefined, endDate: string | undefined): boolean => {
    if (!startDate || !endDate) return false;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Reset time to midnight to compare just the dates
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    
    return startDay.getTime() !== endDay.getTime();
  };

  const refreshEventData = async (): Promise<void> => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      const updatedEventData = await getEvent(Number(eventId));
      setEvent(updatedEventData);
      setLoading(false);
    } catch (err) {
      console.error("Error refreshing event data:", err);
      setError(err instanceof Error ? err.message : 'Failed to refresh event data');
      setLoading(false);
    }
  };

  const workerCounts = getWorkerCounts();
  const jobStats = calculateJobStats();
  const jobsWithWorkerCounts = getJobWorkerCounts();
  
  return {
    event,
    loading,
    error,
    sortedWorkers,
    workerCounts,
    jobStats,
    jobsWithWorkerCounts,
    isMultiDayEvent,
    refreshEventData
  };
};

export default useEventData;