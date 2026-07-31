import { z } from 'zod';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_REQUIREMENTS,
  PASSWORD_COMPLEXITY_MESSAGE,
} from '../utils/passwordPolicy.js';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, PASSWORD_COMPLEXITY_MESSAGE)
    .max(PASSWORD_MAX_LENGTH, PASSWORD_COMPLEXITY_MESSAGE)
    .regex(PASSWORD_REQUIREMENTS.lowercase, PASSWORD_COMPLEXITY_MESSAGE)
    .regex(PASSWORD_REQUIREMENTS.uppercase, PASSWORD_COMPLEXITY_MESSAGE)
    .regex(PASSWORD_REQUIREMENTS.digit, PASSWORD_COMPLEXITY_MESSAGE)
    .regex(PASSWORD_REQUIREMENTS.special, PASSWORD_COMPLEXITY_MESSAGE),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
