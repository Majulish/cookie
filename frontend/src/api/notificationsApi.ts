import axios from 'axios';
import { API_BASE_URL } from './config';

export interface Notification {
    id: number;
    user_id: number;
    message: string;
    created_at: string;
    event_id: number | null;
    is_read: boolean;
}
  
interface CreateNotificationRequest {
    message: string;
}
    
// Axios instance with common configuration
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
});
  
export async function getUserNotifications(): Promise<Notification[]> {
    try {
      // Fixed: Use the specific notifications endpoint instead of root endpoint
      const response = await axiosInstance.get<Notification[]>('/notifications');
      console.log("response: ", response);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to fetch notifications');
      }
      throw error;
    }
}
  
export async function createNotification(request: CreateNotificationRequest): Promise<Notification> {
    try {
      // Fixed: Use the specific notifications endpoint for creating notifications
      const response = await axiosInstance.post<Notification>('/notifications', request);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to create notification');
      }
      throw error;
    }
}