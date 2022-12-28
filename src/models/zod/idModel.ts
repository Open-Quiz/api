import * as z from 'zod';

export const IdModel = z.object({
    id: z.coerce.number().int().min(1),
});

export const IdArrayModel = z.object({
    ids: z.number().int().min(1).array(),
});

export type IdArray = z.infer<typeof IdArrayModel>;
