import { z } from 'zod';

/**
 * Validation schema for user creation form
 */
export const createUserSchema = z.object({
  userName: z
    .string()
    .min(1, 'نام کاربری الزامی است')
    .trim(),
  password: z
    .string()
    .min(1, 'رمز عبور الزامی است')
    .min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  firstName: z
    .string()
    .min(1, 'نام الزامی است')
    .trim(),
  lastName: z
    .string()
    .min(1, 'نام خانوادگی الزامی است')
    .trim(),
  email: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: 'آدرس ایمیل معتبر نیست' }
    ),
  phone: z
    .string()
    .trim().optional(),
  mobileNumber: z
    .string()
    .min(1, 'شماره موبایل الزامی است')
    .regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست (مثال: 09123456789)'),
  grpPublicId: z
    .string()
    .min(1, 'گروه الزامی است')
    .trim(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;


export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'نام الزامی است').trim(),
  lastName: z.string().min(1, 'نام خانوادگی الزامی است').trim(),
  email: z.string().email('آدرس ایمیل معتبر نیست').trim(),
  phone: z.string().trim(),
  mobileNumber: z.string().min(1, 'شماره موبایل الزامی است').regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست (مثال: 09123456789)'),
});


export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  mobileNumber: string;
}

export const resetPassword = z.object({
  password: z
    .string()
    .min(6, 'لطفاً رمز عبور جدید را وارد کنید.')
    .trim(),
  mustChangePass: z.boolean().optional()
});

export type ResetPassword = z.infer<typeof resetPassword>;
