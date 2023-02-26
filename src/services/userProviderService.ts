import { Provider, UserData, UserProvider } from '@prisma/client';
import prisma from '../client/instance';
import { ProviderData } from './providers/serviceProvider';

export namespace UserProviderService {
    /**
     * Creates a new user data and user provider entry for the user. This
     * should only be used if the user doesn't have any data or provider yet.
     *
     * @param {number} userId The id of the user to create the data and provider for
     * @param {Provider} provider The provider that the data is from
     * @param {ProviderData} providerData The data extracted from the provider
     * @returns {Promise<[UserData, UserProvider]>} The created user data and user provider
     */
    export async function createUserDataAndProvider(
        userId: number,
        provider: Provider,
        providerData: ProviderData,
    ): Promise<[UserData, UserProvider]> {
        const createUserData = prisma.userData.create({
            data: {
                userId,
                ...providerData.data,
            },
        });

        const createUserProvider = prisma.userProvider.create({
            data: {
                userId,
                provider,
                providerId: providerData.providerId,
            },
        });

        return await prisma.$transaction([createUserData, createUserProvider]);
    }

    /**
     * Creates a new user provider for the user or updates the provider id if there is
     * already a provider for the user and they're changing the account they're linking
     * for that provider.
     *
     * @param {number} userId The user id to create or update the provider for
     * @param {Provider} provider The provider that the data is from
     * @param {ProviderData} providerData The data extracted from the provider
     * @returns {Promise<UserProvider>} The created or updated user provider
     */
    export async function createOrUpdateUserProvider(
        userId: number,
        provider: Provider,
        providerData: ProviderData,
    ): Promise<UserProvider> {
        return await prisma.userProvider.upsert({
            where: { provider_userId: { provider, userId } },
            create: {
                userId,
                provider,
                providerId: providerData.providerId,
            },
            update: {
                providerId: providerData.providerId,
            },
        });
    }
}
