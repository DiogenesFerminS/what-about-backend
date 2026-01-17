import z from 'zod/v4';

export const updateProfileSchema = z.object({
  name: z
    .string({
      error: (iss) => {
        if (iss.input === undefined) {
          return 'Name cannot be empty';
        }

        if (typeof iss.input !== 'string') {
          return 'Name must be a string';
        }
      },
    })
    .max(16, 'The Name is too long')
    .trim()
    .optional()
    .transform((val) => {
      if (val === '') return null;
      return val;
    }),
  bio: z
    .string({
      error: (iss) => {
        if (iss.input === undefined) {
          return 'Biography cannot be empty';
        }

        if (typeof iss.input !== 'string') {
          return 'Biography must be a string';
        }
      },
    })
    .max(160, 'The Biography is too long')
    .trim()
    .optional()
    .transform((val) => {
      if (val === '') return null;
      return val;
    }),
  location: z
    .string({
      error: (iss) => {
        if (iss.input === undefined) {
          return 'Location cannot be empty';
        }

        if (typeof iss.input !== 'string') {
          return 'Location must be a string';
        }
      },
    })
    .max(60, 'Location too long')
    .trim()
    .optional()
    .transform((val) => {
      if (val === '') return null;
      return val;
    }),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
