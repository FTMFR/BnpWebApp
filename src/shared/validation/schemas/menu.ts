import { z } from 'zod'

/**
 * Input schema for menu creation form (before transformation)
 * This represents the form state during user input
 */
export const createMenuInputSchema = z.object({
  Title: z.string().min(1, 'عنوان منو الزامی است').trim(),
  Path: z.string().min(1, 'مسیر منو الزامی است').trim(),
  ParentPublicId: z.string().nullable(),
})

/**
 * Validation schema for menu creation form (with transformation)
 * This transforms the input to the final output type
 */
export const createMenuSchema = z.object({
  Title: z
    .string()
    .min(1, 'عنوان منو الزامی است')
    .trim(),
  Path: z
    .string()
    .min(1, 'مسیر منو الزامی است')
    .trim(),
  ParentPublicId: z.string().nullable(),
})

/**
 * Form input data type (what the user types)
 */
export type CreateMenuFormInput = z.infer<typeof createMenuInputSchema>

/**
 * Form data type after validation (transformed)
 */
export type CreateMenuFormData = z.infer<typeof createMenuSchema>
