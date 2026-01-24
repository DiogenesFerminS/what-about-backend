import z from 'zod/v4';

export const usersTermSchema = z.object({
  term: z
    .string('term must be a string')
    .trim()
    .max(30, 'the term is too long ')
    .optional(),

  page: z.coerce
    .number()
    .int({ message: 'page must be a positive number' })
    .min(1, { message: 'page too short' })
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50, { message: 'The limit is 50 opinions' })
    .default(10),
});

export type userTermDto = z.infer<typeof usersTermSchema>;
