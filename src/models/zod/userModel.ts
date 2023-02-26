import { User, UserData } from '@prisma/client';
import { z } from 'zod';
import { UserModel } from './generated';

export const UpdateUserModel = UserModel.pick({ mainProvider: true });

export type CompleteUser = User & { data: UserData | null };
export type UpdateUser = z.infer<typeof UpdateUserModel>;
