import z from 'zod/v4';

const uuidRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const repostSchema = z.object({
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
    .min(3, 'content is too short')
    .max(2700, 'content is too long')
    .trim(),
  title: z.string({
    error: (iss) => {
      if (iss.input === undefined) {
        return "title content can't be empty";
      }

      if (typeof iss.input !== 'string') {
        return 'title must be a string';
      }
    },
  }),
  repostId: z
    .string({
      error: (iss) => {
        if (iss.input === undefined) {
          return 'the repostId cannot be empty';
        }

        if (typeof iss !== 'string') {
          return 'the repostId must be a string';
        }
      },
    })
    .regex(uuidRegex, 'Invalid Id')
    .nonempty('the repostId cannot be empty')
    .trim(),
});

export type RepostDto = z.infer<typeof repostSchema>;
