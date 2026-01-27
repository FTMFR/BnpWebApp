import { z } from 'zod';

/**
 * Validation schema for login form
 */
export const loginSchema = z.object({
  userName: z
    .string()
    .min(1, 'لطفاً نام کاربری را وارد کنید.')
    .trim(),
  password: z
    .string()
    .min(1, 'لطفاً رمز عبور را وارد کنید.')
    .trim(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

