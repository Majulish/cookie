import axios from 'axios';
import { SignInFormInputs } from '../pages/signin/signInScheme';
import { SignUpFormInputs } from '../pages/signup/signUpScheme';
import {API_BASE_URL} from './config'

export const signInApi = async (data: SignInFormInputs) => {
  try {
      const response = await axios.post(`${API_BASE_URL}/users/signin`, data, {
          withCredentials: true,
      });
      document.cookie = `access_token=${response.data.access_token}; path=/`;
      document.cookie = `refresh_token=${response.data.refresh_token}; path=/`;
      console.log('Signin response:', response);
      return response.data;
  } catch (error) {
      console.error('Signin error:', error);
      throw error;
  }
};

export const signUpApi = async (data: Omit<SignUpFormInputs, 'confirmPassword'>) => {
  console.log(data);
  const response = await axios.post(`${API_BASE_URL}/users/signup`, data);
  return response.data;
};