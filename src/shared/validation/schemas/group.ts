import { z } from 'zod';

export const createGroupInputSchema = z.object({
  Title: z.string().min(1, 'عنوان گروه الزامی است').trim(),
  Description: z.string().trim().optional(),
  ParentPublicId: z.string(),
});


export type CreateGroupFormInput = z.infer<typeof createGroupInputSchema>;


export const updateGroupInputSchema = z.object({
  Title: z.string().min(1, 'عنوان گروه الزامی است').trim(),
  ParentPublicId: z.string(),
});


export type UploadGroupFormInput = z.infer<typeof createGroupInputSchema>;

