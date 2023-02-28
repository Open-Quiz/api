import { Provider, UserProvider } from '@prisma/client';
import prisma from '../client/instance';
import { ProviderData } from './providers/serviceProvider';

export namespace UserProviderService {
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
