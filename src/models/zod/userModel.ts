import { User, UserData } from '@prisma/client';

export type CompleteUser = User & { data: UserData | null };
