import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(60),
  email: z.string().email('Please enter a valid work email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['EMPLOYEE', 'HR_ADMIN']).default('EMPLOYEE'),
  department: z.string().min(2, 'Department is required').default('Engineering'),
  designation: z.string().min(2, 'Designation is required').default('Software Engineer'),
  employeeCode: z.string().optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  department: z.string().optional(),
  designation: z.string().optional(),
});
