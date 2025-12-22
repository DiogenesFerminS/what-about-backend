import z from 'zod/v4';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export const newPasswordSchema = z.object({
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

export type NewPasswordDto = z.infer<typeof newPasswordSchema>;
