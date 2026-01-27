import { z } from 'zod'

/**
 * Input schema for menu creation form (before transformation)
 * This represents the form state during user input
 */
export const createMenuInputSchema = z.object({
  Title: z.string().min(1, 'عنوان منو الزامی است').trim(),
  Path: z.string().min(1, 'مسیر منو الزامی است').trim(),
  ParentPublicId: z.string().optional(),
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
  ParentPublicId: z
    .union([z.string(), z.undefined()])
    .optional()
    .transform((val) => {
      // Convert empty string to undefined
      if (val === '' || val === null || val === undefined) {
        return undefined
      }
      return val
    })
    .refine(
      (val) => {
        // Allow undefined
        if (val === undefined) {
          return true
        }
        // If provided, validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        return uuidRegex.test(val)
      },
      {
        message: 'شناسه منوی والد باید فرمت UUID معتبر باشد',
      }
    ),
})

/**
 * Form input data type (what the user types)
 */
export type CreateMenuFormInput = z.infer<typeof createMenuInputSchema>

/**
 * Form data type after validation (transformed)
 */
export type CreateMenuFormData = z.infer<typeof createMenuSchema>
