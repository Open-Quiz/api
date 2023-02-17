import * as z from 'zod';

export const IdModel = z.object({
    id: z.coerce.number().int().min(1),
});

export type IdParam = z.infer<typeof IdModel>;
