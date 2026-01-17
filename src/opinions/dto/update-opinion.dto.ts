import z from 'zod/v4';

export const updatedOpinionSchema = z.object({
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
    .max(500, 'content is too long')
    .trim()
    .optional(),

  deleteImage: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return Boolean(val);
  }, z.boolean().optional()),
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

export type updatedOpinionDto = z.infer<typeof updatedOpinionSchema>;
