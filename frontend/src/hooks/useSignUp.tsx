import { useState } from 'react';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { calculateAge, isValidDate } from '../utils';
import useSignUpRequest from './useSignUpRequest';

const signUpSchema = z.object({
  username: z.string().min(4, 'Username must be at least 4 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  id: z.string().regex(/^\d{9}$/, 'ID must be 9 digits'),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
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

export interface SignUpErrors{
  username: string,
    firstName: string,
    lastName: string,
    id: string,
    phoneNumber: string,
    dateOfBirth: string,
    email: string,
    password: string,
    confirmPassword: string,
    companyName: string,
    role: string
}

export const useSignUp = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<SignUpErrors>({
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

  const updateErrors = (update: Partial<SignUpErrors>)=> {
    setErrors({...errors,
      ...update
    })
  }

  const [globalError, setGlobalError] = useState<string>(''); 

  const {loading, isSuccess, doRequest, setIsSuccess} = useSignUpRequest({setGlobalError, updateErrors});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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

    console.log("Form data!:", formData);  
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

      return;
    } else {
      await doRequest(formData);
    }
  
  };

  const handleDialogClose = () => {
    setIsSuccess(false);
    navigate('/sign-up');
  };
  
  return { errors, handleSubmit, loading, isSuccess, handleDialogClose, globalError }; // Return globalError
};

