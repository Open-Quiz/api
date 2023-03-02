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
    export function isUserDataOutdated(
        currentUserData: UserDataWithoutId | null,
        newUserData: UserDataWithoutId,
    ): boolean {
        return (
            currentUserData === null ||
            currentUserData.username !== newUserData.username ||
            currentUserData.profilePicture !== newUserData.profilePicture
        );
    }

    /**
     * Updates the user's data if the respective provider is the main provider and the data
     * is outdated.
     *
     * @param {Provider} provider The provider that the user data is from
     * @param {UserData} data The new user data
     * @returns {Promise<CompleteUser>} The updated user
     */
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

        if (isUserDataOutdated(user.data, data)) {
            user.data = await updateUserData(data.userId, data);
        }

        return user;
    }

    /**
     * Updates the user's data or creates it, if the user doesn't have any data yet.
     *
     * @param {number} userId The id of the user to update the data for
     * @param {UserData} data The new user data
     * @returns {Promise<UserData>} The updated user data
     */
    export async function updateUserData(userId: number, data: UserData): Promise<UserData> {
        return await prisma.userData.upsert({
            where: { userId },
            create: data,
            update: data,
        });
    }

    /**
     * Deletes the user data for the given user id.
     *
     * @param userId The id of the user to delete the data for
     */
    export async function deleteUserData(userId: number): Promise<void> {
        await prisma.userData.delete({ where: { userId } });
    }
}
