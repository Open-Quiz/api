import { Provider, UserData } from '@prisma/client';
import prisma from '../client/instance';
import UserDeletedError from '../errors/UserDeletedError';
import { CompleteUser } from '../models/zod/userModel';
import { UserDataWithoutId } from './providers/serviceProvider';

export namespace UserDataService {
    /**
     * Checks whether the user data is no longer up to date.
     *
     * @param {UserDataWithoutId | null} currentUserData The currently persisted user data
     * @param {UserDataWithoutId} newUserData The recently fetched user data
     * @returns {boolean} Whether is current user data is outdated
     */
    export function isUserDataIsOutdated(
        currentUserData: UserDataWithoutId | null,
        newUserData: UserDataWithoutId,
    ): boolean {
        return (
            currentUserData === null ||
            currentUserData.username !== newUserData.username ||
            currentUserData.profilePicture !== newUserData.profilePicture
        );
    }

    export async function updateUserDataIfOutdated(provider: Provider, data: UserData): Promise<CompleteUser> {
        const user = await prisma.user.findFirst({
            where: { id: data.userId },
            include: { data: true },
        });

        if (!user) {
            throw new UserDeletedError(data.userId);
        }

        if (user.mainProvider !== provider) {
            // Only use the data from the user's main provider
            return user;
        }

        if (isUserDataIsOutdated(user.data, data)) {
            user.data = await updateUserData(data.userId, data);
        }

        return user;
    }

    export async function updateUserData(userId: number, data: UserData): Promise<UserData> {
        return await prisma.userData.upsert({
            where: { userId },
            create: data,
            update: data,
        });
    }

    export async function deleteUserData(userId: number): Promise<void> {
        await prisma.userData.delete({ where: { userId } });
    }
}
