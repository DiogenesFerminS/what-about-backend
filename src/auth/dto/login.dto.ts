import z from 'zod/v4';

// const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export const loginSchema = z.object(
  {
    term: z
      .string({
        error: (iss) => {
          if (iss.input === undefined) {
            return 'The identifier is required';
          }

          if (typeof iss.input !== 'string') {
            return 'The identifier must be a string';
          }
        },
      })
      .min(6, 'The identifier es too short')
      .max(255)
      .trim()
      .toLowerCase(),
    password: z
      .string({
        error: (iss) => {
          if (iss.input === undefined) {
            return 'Password is required';
          }

          if (typeof iss.input !== 'string') {
            return 'The password must be a string';
          }
        },
      })
      .min(8, 'The password is too short')
      .max(16, 'The password is too long')
      // .regex(
      //   passwordRegex,
      //   'Invalid password the password must include: lowercase letters, uppercase letters, and special characters ',
      // )
      .trim(),
  },
  'Invalid Object',
);

export type LoginDto = z.infer<typeof loginSchema>;
