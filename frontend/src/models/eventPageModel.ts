export interface EventWorker {
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
  
  export interface eventJob{
    job_title: string;
    openings: number;
    slots: number;
  }
  
 export interface DetailedEvent {
    id: number;
    name: string;
    description: string;
    city: string;
    address: string;
    start_datetime: string;
    end_datetime: string;
    status: string;
    workers: EventWorker[];
    jobs: eventJob[];
  }