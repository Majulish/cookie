import axios from 'axios';
import { API_BASE_URL, SIGN_IN_URL } from './config';

export interface ProfileData {
  age: number;
  city: string;
  company_id: string;
  company_name: string;
  email: string;
  full_name: string;
  phone: string;
  rating: number;
  reviews: Review[];
  hr_manager_name: string;
  hr_manager_phone: string;
}

export interface Review {
  event_id: number;
  review_text: string;
  reviewer_name: string;
  timestamp: string;
  event_name: string;
}

/**
 * Get the profile for a specific user
 * @param userId - The ID of the user to fetch the profile for. Use 0 to get your own profile (workers only).
 * @returns Promise with the profile data
 */
export const getProfile = async (userId: number): Promise<ProfileData> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/profile/${userId}`, {
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
        if (userId === 0) {
          console.error('Only workers can use this endpoint');
          throw new Error('Only workers can view their own profile');
        } else {
          console.error('Unauthorized access to this profile');
          throw new Error('Unauthorized access');
        }
      }
      if (error.response?.status === 404) {
        console.error('User not found');
        throw new Error('User not found');
      }
    }
    console.error('Error fetching profile:', error);
    throw error;
  }
};