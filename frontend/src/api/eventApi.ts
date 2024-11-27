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
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            console.error('Session expired - please log in again');
            throw new Error('Authentication required');
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
