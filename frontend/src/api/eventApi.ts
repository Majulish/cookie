import axios from 'axios';
import {  EventAPIPayload, EventFormInputs, convertAPIEventToFormEvent  } from '../pages/home/crate_event/eventScheme';
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

export const getEvents = async (): Promise<EventFormInputs[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/events/get_events`, {
            withCredentials: true,
        });
        // Convert each event from API format to form format
        return response.data.map((event: EventAPIPayload) => convertAPIEventToFormEvent(event));
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};