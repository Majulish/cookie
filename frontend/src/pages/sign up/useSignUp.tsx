import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignUpFormData } from '../types/auth'; // Assuming you have this type defined
import useSignUpRequest from './useSignUpRequest';

export const useSignUp = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({
    username: '',
    firstName: '',
    lastName: '',
    id: '',
    phoneNumber: '',
    dateOfBirth: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    role: '',
  });

  const [globalError, setGlobalError] = useState<string>('');

  const { loading, isSuccess, doRequest, setIsSuccess } = useSignUpRequest({
    setGlobalError,
    setErrors,
  });

  const handleSubmit = async (formData: SignUpFormData) => {
    await doRequest(formData);
  };

  const handleDialogClose = () => {
    setIsSuccess(false);
    navigate('/sign-up');
  };

  return { errors, handleSubmit, loading, isSuccess, handleDialogClose, globalError };
};