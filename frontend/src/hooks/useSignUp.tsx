import { useState } from 'react';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { calculateAge, isValidDate } from '../utils';

const signUpSchema = z.object({
  username: z.string().min(4, 'Username must be at least 4 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  id: z.string().regex(/^\d{9}$/, 'ID must be 9 digits'),
  phoneNumber: z.string().regex(/^05\d{8}$/, 'Phone number must be 10 digits and start with 05'),
  dateOfBirth: z
    .string()
    .regex(/^\d{2}[./]\d{2}[./]\d{4}$/, 'Date of birth must be in DD/MM/YYYY or DD.MM.YYYY format')
    .refine((dob) => {
      const [day, month, year] = dob.split(/[./]/).map(Number);
      return isValidDate(day, month, year);
    }, 'Date of birth is not valid')
    .refine((dob) => {
      const birthDateParts = dob.split(/[./]/);
      const formattedDateOfBirth = `${birthDateParts[2]}-${birthDateParts[1]}-${birthDateParts[0]}`;
      const age = calculateAge(formattedDateOfBirth);
      return age >= 18 && age <= 80;
    }, 'Age must be between 18 and 80'),
  companyName: z.string().min(2, 'Company Name must be at least 2 characters'),
  role: z.string().min(2, 'Must choose a role'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    .regex(/(?=.*[a-z])(?=.*[A-Z])/, 'Password must contain both uppercase and lowercase letters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

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
  const [loading, setLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string>(''); // State for global error

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true); // Set loading to true when the form submission starts
    setGlobalError(''); // Clear global error before new submission

    const data = new FormData(event.currentTarget);
    const formData = {
      username: data.get('username') as string,
      id: data.get('id') as string,
      phoneNumber: data.get('phoneNumber') as string,
      dateOfBirth: data.get('dateOfBirth') as string,
      email: data.get('email') as string,
      password: data.get('password') as string,
      confirmPassword: data.get('confirmPassword') as string,
      companyName: data.get('companyName') as string,
      firstName: data.get('firstName') as string,
      lastName: data.get('lastName') as string,
      role: data.get('role') as string,
    };

    console.log("Form data!:", formData);  // Log form data before submission
    const result = signUpSchema.safeParse(formData);

    if (!result.success) {
      const newErrors = result.error.formErrors.fieldErrors;
      setErrors({
        username: newErrors.username?.[0] || '',
        firstName: newErrors.firstName?.[0] || '',
        lastName: newErrors.lastName?.[0] || '',
        id: newErrors.id?.[0] || '',
        phoneNumber: newErrors.phoneNumber?.[0] || '',
        dateOfBirth: newErrors.dateOfBirth?.[0] || '',
        email: newErrors.email?.[0] || '',
        password: newErrors.password?.[0] || '',
        confirmPassword: newErrors.confirmPassword?.[0] || '',
        role: newErrors.role?.[0] || '',
        companyName: newErrors.companyName?.[0] || '',
      });

      setLoading(false);  // Stop loading when validation fails
      return;
    } else {
      try {
        console.log("Sending request to backend...");
        const response = await axios.post('http://localhost:8000/users/signup', formData);
        console.log('RESPONSE', response);

        const responseData = response.data;
        console.log("Response received:", responseData);

        if (response.status === 200) {
          if (responseData.message === 'User registered successfully') {
            setIsSuccess(true);  // Show dialog on successful registration
          } else if (responseData.message === 'Username already exists') {
            setErrors((prevErrors) => ({
              ...prevErrors,
              username: 'Username already exists',
            }));
          }
        } else {
          setGlobalError(responseData.message || 'Registration failed');
        }
      } catch (error) {
        setGlobalError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDialogClose = () => {
    setIsSuccess(false);
    navigate('/');
  };

  return { errors, handleSubmit, loading, isSuccess, handleDialogClose, globalError }; // Return globalError
};
