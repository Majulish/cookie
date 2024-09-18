import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInApi } from '../../api/authApi';
import { SignInFormInputs } from './signInScheme';

export const useSignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (data: SignInFormInputs) => {
    setLoading(true);
    setError(null);

    try {
      await signInApi(data);
      navigate('/home-page');
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
