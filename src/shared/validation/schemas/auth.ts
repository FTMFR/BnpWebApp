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

/**
 * Validation schema for change password form
 */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'لطفاً رمز عبور فعلی را وارد کنید.')
    .trim(),
  newPassword: z
    .string()
    .min(1, 'لطفاً رمز عبور جدید را وارد کنید.')
    .min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد.')
    .trim(),
  confirmPassword: z
    .string()
    .min(1, 'لطفاً تکرار رمز عبور جدید را وارد کنید.')
    .trim(),
}).refine((values) => values.newPassword === values.confirmPassword, {
  message: 'رمز عبور جدید و تکرار آن یکسان نیستند.',
  path: ['confirmPassword'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

