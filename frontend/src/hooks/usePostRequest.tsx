import { useState } from 'react';
import axios from 'axios';

export const usePostRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postRequest = async (url: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(url, data);
      setLoading(false);
      return response.data;
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || 'Network error. Please try again.');
      throw err;
    }
  };

  return { postRequest, loading, error };
};
