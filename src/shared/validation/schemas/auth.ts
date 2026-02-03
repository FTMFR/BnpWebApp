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
 * Validation schema for current user change-password form (CurrentPassword, NewPassword, ConfirmNewPassword).
 */
export const changeMyPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'رمز عبور فعلی الزامی است').trim(),
    newPassword: z
      .string()
      .min(6, 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد')
      .trim(),
    confirmNewPassword: z.string().min(1, 'تکرار رمز عبور جدید الزامی است').trim(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'رمز عبور جدید و تکرار آن یکسان نیستند',
    path: ['confirmNewPassword'],
  });

export type ChangeMyPasswordFormData = z.infer<typeof changeMyPasswordSchema>;
