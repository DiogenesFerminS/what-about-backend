import z from 'zod/v4';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const resendEmailSchema = z.object({
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
});

export type ResendEmailDto = z.infer<typeof resendEmailSchema>;
