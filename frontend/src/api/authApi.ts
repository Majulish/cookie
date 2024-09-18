import axios from 'axios';
import { SignInFormInputs } from '../pages/signin/signInScheme';

const API_BASE_URL = 'http://localhost:8000';

export const signInApi = async (data: SignInFormInputs) => {
  const response = await axios.post(`${API_BASE_URL}/users/signin`, data);
  return response.data;
};