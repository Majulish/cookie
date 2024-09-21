import axios from 'axios';
import { SignInFormInputs } from '../pages/signin/signInScheme';
import { SignUpFormInputs } from '../pages/signup/signUpScheme';

const API_BASE_URL = 'http://localhost:8000';

export const signInApi = async (data: SignInFormInputs) => {
  const response = await axios.post(`${API_BASE_URL}/users/signin`, data);
  return response.data;
};

export const signUpApi = async (data: SignUpFormInputs) => {
  const response = await axios.post(`${API_BASE_URL}/users/signup`, data);
  return response.data;
};