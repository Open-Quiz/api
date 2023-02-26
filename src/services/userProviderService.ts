import { Provider, UserData, UserProvider } from '@prisma/client';
import prisma from '../client/instance';
import { ProviderData } from './providers/serviceProvider';

export namespace UserProviderService {
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
