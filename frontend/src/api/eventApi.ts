import axios from 'axios';
import {  EventAPIPayload, RecievedEvent, convertRecivedEventToMyEvent , MyEventScheme } from '../pages/home/create_event/eventScheme';
import { API_BASE_URL, SIGN_IN_URL } from './config';

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



