import axios from 'axios';
import { API_BASE_URL } from './config';

export interface Notification {
    id: number;
    user_id: number;
    message: string;
    created_at: string;
    event_id: number | null;
    is_read: boolean;
    is_approved: boolean;
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


export async function markNotificationsAsRead(notificationIds: number[]): Promise<{message: string}> {
  try {
    const response = await axiosInstance.post<{message: string}>('/notifications/mark_read', {
      notification_ids: notificationIds
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to mark notifications as read');
    }
    throw error;
  }
}

export async function approveNotification(notificationId: number, eventId: number | null): Promise<{message: string}> {
  try {
    const response = await axiosInstance.put<{message: string}>(
      `/notifications/${notificationId}/approve`, 
      { event_id: eventId }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to approve notification');
    }
    throw error;
  }
}

export async function handleNotificationDismissal(notificationId: number): Promise<void> {
  // This function doesn't make an API call since there's no decline endpoint
  console.log(`Notification ${notificationId} dismissed`);
  return Promise.resolve();
}