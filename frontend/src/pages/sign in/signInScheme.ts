import { z } from 'zod';

export const signInSchema = z.object({
  username: z.string().min(4, 'Username must be at least 4 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignInFormInputs = z.infer<typeof signInSchema>;