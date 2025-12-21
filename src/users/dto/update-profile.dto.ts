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
    .min(3, 'The Name is too short')
    .max(16, 'The Name is too long')
    .trim()
    .optional(),
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
    .min(1, 'The Biography is too short')
    .max(160, 'The Biography is too long')
    .trim()
    .optional(),
  avatarUrl: z
    .string({
      error: (iss) => {
        if (iss.input === undefined) {
          return 'AvatarUrl cannot be empty';
        }

        if (typeof iss.input === 'string') {
          return 'AvatarUrl must be a string';
        }
      },
    })
    .max(1024, 'The avatarUrl is too long')
    .trim()
    .optional(),
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
    .max(255, 'Location too long')
    .min(3, 'Location too short')
    .trim()
    .optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
