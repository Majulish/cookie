import { useState } from 'react';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const signInSchema = z.object({
  username: z
    .string()
    .min(4, 'Username must be at least 4 characters'), 
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),  
});

export const useSignIn = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ username: string; password: string }>({
    username: '',
    password: '',
  });
  const [globalError, setGlobalError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true); 
    setGlobalError(''); 
    setErrors({ username: '', password: '' }); 

    const data = new FormData(event.currentTarget);
    const formData = {
      username: data.get('username') as string,
      password: data.get('password') as string,
    };

    const result = signInSchema.safeParse(formData);
    if (!result.success) {
      const newErrors = result.error.formErrors.fieldErrors;
      setErrors({
        username: newErrors.username?.[0] || '',
        password: newErrors.password?.[0] || '',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/users/signin', formData);
      if (response.status === 200) {
        navigate('/home-page');  
      } else {
        setGlobalError(response.data.message || 'Sign in failed');
      }
    } catch (error) {
      setGlobalError('Network error. Please try again.');
    } finally {
      setLoading(false); 
    }
  };

  return {
    errors,
    globalError,
    handleSubmit,
    loading,
  };
};
