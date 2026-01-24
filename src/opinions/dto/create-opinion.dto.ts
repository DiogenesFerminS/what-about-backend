import z from 'zod/v4';

export const createOpinionSchema = z.object({
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
  title: z
    .string({
      error: (iss) => {
        if (iss.input === undefined) {
          return "title content can't be empty";
        }

        if (typeof iss.input !== 'string') {
          return 'title must be a string';
        }
      },
    })
    .min(3, 'title must have 3 characters at least')
    .max(100, 'title must have maximum 100 characters')
    .trim(),
  // imageUrl: z
  //   .string({
  //     error: (iss) => {
  //       if (iss.input === undefined) {
  //         return "imageUrl can't be empty";
  //       }

  //       if (typeof iss.input !== 'string') {
  //         return 'imageUrl must be a string';
  //       }
  //     },
  //   })
  //   .max(1024, 'imageUrl too long')
  //   .optional(),
});

export type CreateOpinionDto = z.infer<typeof createOpinionSchema>;
