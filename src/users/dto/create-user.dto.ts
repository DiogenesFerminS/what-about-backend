import z from 'zod/v4';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export const createUserSchema = z.object({
  email: z
    .string({
      error: (iss) => {
        if (iss.input === undefined) {
          return 'Email is required';
        }

        if (typeof iss.input !== 'string') {
          return 'Email must be a string';
        }
      },
    })
    .regex(emailRegex, 'Invalid Email')
    .max(255, 'The email is too long')
    .trim()
    .toLowerCase(),
  username: z
    .string({
      error: (iss) => {
        if (iss.input === undefined) {
          return 'Username is required';
        }

        if (typeof iss.input !== 'string') {
          return 'The must be a string';
        }
      },
    })
    .min(6, 'The Username is too short')
    .max(16, 'The username is too long')
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
    .regex(
      passwordRegex,
      'Invalid password the password must include: lowercase letters, uppercase letters, and special characters ',
    )
    .trim(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
