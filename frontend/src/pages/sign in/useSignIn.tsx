import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface SignInData {
  username: string;
  password: string;
}

export const useSignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (data: SignInData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:8000/users/signin', data);
      if (response.status === 200) {
        navigate('/home-page');
      } else {
        setError(response.data.message || 'Sign in failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    loading,
    error,
  };
};