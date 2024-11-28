import axios from 'axios';
import {  EventAPIPayload, RecievedEvent, convertRecivedEventToMyEvent , MyEventScheme } from '../pages/home/crate_event/eventScheme';
import { API_BASE_URL } from './config';

export const createEvent = async (data: EventAPIPayload) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/events/create_event`, data, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating event:", error);
        throw error;
    }
};

export const getMyEvents = async (): Promise<MyEventScheme[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/events/my_events`, {
            withCredentials: true,
        });
        return response.data.map((event: RecievedEvent) => convertRecivedEventToMyEvent(event));
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                console.error('Session expired - please log in again');
                throw new Error('Authentication required');
            }
            if (error.response?.status === 404) {
                console.error('Endpoint not found');
                throw new Error('API endpoint not found');
            }
        }
        console.error('Error fetching events:', error);
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

// // You might want to add this interface to match the backend response structure
// interface FeedResponse {
//     events: RecievedEvent[];
// }

// export const getEventsFeed = async (filters?: Record<string, string>): Promise<MyEventScheme[]> => {
//     try {
//         const response = await axios.get<FeedResponse>(`${API_BASE_URL}/events/feed`, {
//             params: filters,  // Add query parameters for filters
//             withCredentials: true,
//         });
        
//         // Access the events array from the response structure
//         return response.data.events.map((event: RecievedEvent) => convertRecivedEventToMyEvent(event));
//     } catch (error) {
//         if (axios.isAxiosError(error)) {
//             if (error.response?.status === 401) {
//                 console.error('Session expired - please log in again');
//                 throw new Error('Authentication required');
//             }
//             if (error.response?.status === 403) {
//                 console.error('Only workers can access this endpoint');
//                 throw new Error('Unauthorized access');
//             }
//             if (error.response?.status === 404) {
//                 console.error('Endpoint not found');
//                 throw new Error('API endpoint not found');
//             }
//         }
//         console.error('Error fetching event feed:', error);
//         throw error;
//     }
// };


export const applyForJob = async (eventId: number, jobTitle: string) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/events/${eventId}/apply`,
            { event_id: eventId, job_title: jobTitle },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("Error applying for job:", error);
        throw error;
    }
};