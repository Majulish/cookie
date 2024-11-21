import axios from 'axios';
import { EventFormInputs } from '../pages/home/crate_event/eventScheme';
import { API_BASE_URL } from './config';

export const createEvent = async (data: EventFormInputs) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/users/create_event`, data, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating event:", error);
        throw error;
    }
};

export const getEvents = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/get_events`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};
