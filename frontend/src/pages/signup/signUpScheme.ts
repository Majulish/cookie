import { z } from 'zod';
import {calculateAge , isValidDate} from './utils'

export const signUpSchema = z.object({
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

export type SignUpFormInputs = z.infer<typeof signUpSchema>;