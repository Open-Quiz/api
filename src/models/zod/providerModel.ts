import { Provider } from '@prisma/client';
import { z } from 'zod';

export const LinkProviderModel = z.object({
    provider: z.nativeEnum(Provider),
    token: z.string(),
    makeMainProvider: z.boolean().optional(),
});

export type LinkProvider = z.infer<typeof LinkProviderModel>;
