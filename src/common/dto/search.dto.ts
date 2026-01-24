import { paginationSchema } from 'src/common/dto/pagination.dto';
import z from 'zod/v4';

export const searchSchema = paginationSchema.extend({
  term: z.string().trim().optional(),
});

export type SearchDto = z.infer<typeof searchSchema>;
