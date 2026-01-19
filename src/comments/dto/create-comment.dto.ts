import z from 'zod/v4';

const uuidRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const createCommentSchema = z.object({
  content: z
    .string({
      error: (iss) => {
        if (iss.input === undefined) {
          return "content can't be empty";
        }

        if (typeof iss.input !== 'string') {
          return 'content must be a string';
        }
      },
    })
    .min(1, 'Content is too short')
    .max(500, 'Content is too long')
    .trim(),
  opinionId: z
    .string({
      error: (iss) => {
        if (iss.input === undefined) {
          return "opinionId can't be empty";
        }

        if (typeof iss.input !== 'string') {
          return 'opinionId must be a string';
        }
      },
    })
    .nonempty('The opinionId is required')
    .regex(uuidRegex, 'The opinionId must be a valid ID')
    .trim(),
});

export type CreateCommentDto = z.infer<typeof createCommentSchema>;
