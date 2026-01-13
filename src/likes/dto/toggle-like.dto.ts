import z from 'zod/v4';

const uuidRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const toggleLikeSchema = z.object({
  opinionId: z
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
    .nonempty('The postId is required')
    .regex(uuidRegex, 'The postId must be a valid ID')
    .trim(),
});

export type ToggleLikeDto = z.infer<typeof toggleLikeSchema>;
