import axios from 'axios';
import {  EventAPIPayload, RecievedEvent, convertRecivedEventToMyEvent , MyEventScheme } from '../pages/home/create_event/eventScheme';
import { API_BASE_URL, SIGN_IN_URL } from './config';

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
  
  interface eventJob{
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
    jobs: eventJob[];
  }
  
  
  export const getEvent = async (eventId: number): Promise<DetailedEvent> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          console.error('Session expired - please log in again');
          window.location.href = SIGN_IN_URL;
          throw new Error('Authentication required');
        }
        if (error.response?.status === 404) {
          console.error('Event not found');
          throw new Error('Event not found');
        }
      }
      console.error('Error fetching event details:', error);
      throw error;
    }
  };

export const createEvent = async (data: EventAPIPayload) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/events/create_event`, data, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                console.error('Session expired - please log in again');
                window.location.href = SIGN_IN_URL;
                throw new Error('Authentication required');
            }
            if (error.response?.status === 403) {
                console.error('Only recruiters and hr managers can access this endpoint');
                window.location.href = SIGN_IN_URL;
                throw new Error('Unauthorized access');
            }
            if (error.response?.status === 404) {
                console.error('Endpoint not found');
                throw new Error('API endpoint not found');
            }
        }
        console.error('Error creating event:', error);
        throw error;
    }
};

export const editEvent = async (id: number ,data: EventAPIPayload) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/events/${id}`, data, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                console.error('Session expired - please log in again');
                window.location.href = SIGN_IN_URL;
                throw new Error('Authentication required');
            }
            if (error.response?.status === 403) {
                console.error('Only recruiters and hr managers can access this endpoint');
                throw new Error('Unauthorized access');
            }
            if (error.response?.status === 404) {
                console.error('Endpoint not found');
                throw new Error('API endpoint not found');
            }
        }
        console.error('Error editing event:', error);
        throw error;
    }
};

export const deleteEvent = async (id: number) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/events/${id}`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                console.error('Session expired - please log in again');
                window.location.href = SIGN_IN_URL;
                throw new Error('Authentication required');
            }
            if (error.response?.status === 403) {
                console.error('Only recruiters and hr managers can access this endpoint');
                throw new Error('Unauthorized access');
            }
            if (error.response?.status === 404) {
                console.error('Endpoint not found');
                throw new Error('API endpoint not found');
            }
        }
        console.error('Error editing event:', error);
        throw error;
    }
};


export const getMyEvents = async (): Promise<MyEventScheme[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/events/my_events`, {
            withCredentials: true,
        });
        console.log('Response:', response);

        return response.data.map((event: RecievedEvent) => convertRecivedEventToMyEvent(event));
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                console.error('Session expired - please log in again');
                window.location.href = SIGN_IN_URL;
                throw new Error('Authentication required');
            }
            if (error.response?.status === 404) {
                console.error('Endpoint not found');
                throw new Error('API endpoint not found');
            }
        }
        console.error('Error fetching my events:', error);
        window.location.href = SIGN_IN_URL;
        throw error;
    }
};

export const generateDescription = async (prompt: string): Promise<string> => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/events/generate_description`,
            { prompt }
        );
        return response.data.description;
    } catch (error) {
        console.error("Error generating description:", error);
        throw error;
    }
};

export const getEventsFeed = async (): Promise<MyEventScheme[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/events/feed`, {
            withCredentials: true,
        });
        return response.data.map((event: RecievedEvent) => convertRecivedEventToMyEvent(event));
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                console.error('Session expired - please log in again');
                window.location.href = SIGN_IN_URL;
                throw new Error('Authentication required');
            }
            if (error.response?.status === 403) {
                console.error('Only workers can access this endpoint');
                throw new Error('Unauthorized access');
            }
            if (error.response?.status === 404) {
                console.error('Endpoint not found');
                throw new Error('API endpoint not found');
            }
        }
        console.error('Error fetching event feed:', error);
        throw error;
    }
    
};

export const applyForJob = async (eventId: number, jobTitle: string) => {
    try{
        const response = await axios.post(
        `${API_BASE_URL}/events/${eventId}/apply`,
        { event_id: eventId, job_title: jobTitle },
        { withCredentials: true }
    );
    return response.data;
   }catch (error) {
    if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
            console.error('Session expired - please log in again');
            window.location.href = SIGN_IN_URL;
            throw new Error('Authentication required');
        }
        if (error.response?.status === 403) {
            console.error('Only workers can access this endpoint');
            throw new Error('Unauthorized access');
        }
        if (error.response?.status === 404) {
            console.error('Endpoint not found');
            throw new Error('API endpoint not found');
        }
    }
    console.error('Error applying for job:', error);
    throw error;
}
};

export const assignWorkerToEvent = async (data: {
    event_id: number;
    worker_id: number;
    job_title: string;
    status: string;
  }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/events/assign_worker/`,
        data,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          console.error('Session expired - please log in again');
          window.location.href = SIGN_IN_URL;
          throw new Error('Authentication required');
        }
        if (error.response?.status === 403) {
          console.error('Only recruiters and hr managers can access this endpoint');
          throw new Error('Unauthorized access');
        }
        if (error.response?.status === 404) {
          console.error('Endpoint not found');
          throw new Error('API endpoint not found');
        }
      }
      console.error('Error assigning worker to event:', error);
      throw error;
    }
  };


  export const feedbackWorker = async (
    eventId: number,
    workerId: number,
    data: {
      rating?: number;
      review?: string;
    }
  ) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/events/${eventId}/feedback_worker`,
        {
          worker_id: workerId,
          rating: data.rating,
          review: data.review
        },
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          console.error('Session expired - please log in again');
          window.location.href = SIGN_IN_URL;
          throw new Error('Authentication required');
        }
        if (error.response?.status === 403) {
          console.error('You do not have permission to rate workers');
          throw new Error('Unauthorized access');
        }
        if (error.response?.status === 404) {
          console.error('Event or worker not found');
          throw new Error('Not found');
        }
        if (error.response?.status === 400) {
          console.error('Invalid request: Either rating or review is required');
          throw new Error('Invalid request');
        }
      }
      console.error('Error submitting worker feedback:', error);
      throw error;
    }
  };

