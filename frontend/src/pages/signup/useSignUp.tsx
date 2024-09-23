import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { signUpApi } from '../../api/authApi';
import { signUpSchema, SignUpFormInputs } from './signUpScheme';

export const useSignUp = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignUpFormInputs>({
    resolver: zodResolver(signUpSchema),
  });

  const mutation = useMutation(signUpApi, {
    onSuccess: (data) => {
      if (data.message === 'User registered successfully') {
        navigate('/sign-in');
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
      if (error.response?.status === 400 && error.response.data.message === "Username already exists") {
        setError('username', { 
          type: 'manual',
          message: 'Username already exists'
        });
      } else {
        console.error('Sign up error:', error);
      }
    },
  });

  const onSubmit: SubmitHandler<SignUpFormInputs> = (data) => {
    mutation.mutate(data);
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    mutation,
  };
};