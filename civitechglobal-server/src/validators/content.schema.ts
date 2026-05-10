import { z } from 'zod';

export const updateContentSchema = z.object({
  value: z.string().min(1, 'Value is required'),
});
