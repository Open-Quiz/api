import * as z from 'zod';

export const AttemptModel = z.object({
    isCorrect: z.boolean(),
});

export type Attempt = z.infer<typeof AttemptModel>;
