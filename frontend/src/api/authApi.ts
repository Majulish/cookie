import axios from 'axios';
import { SignInFormInputs } from '../pages/signin/signInScheme';
import { SignUpFormInputs } from '../pages/signup/signUpScheme';
import {API_BASE_URL} from './config'

export const signInApi = async (data: SignInFormInputs) => {
    console.log(data);
  const response = await axios.post(`${API_BASE_URL}/users/signin`, data,{
    withCredentials: true,
  });
  return response.data;
};

export const signUpApi = async (data: Omit<SignUpFormInputs, 'confirmPassword'>) => {
  console.log(data);
  const response = await axios.post(`${API_BASE_URL}/users/signup`, data);
  return response.data;
};