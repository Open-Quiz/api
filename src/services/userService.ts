import { Provider, UserData } from '@prisma/client';
import prisma from '../client/instance';
import BadRequestError from '../errors/badRequestError';
import UserDeletedError from '../errors/UserDeletedError';
import { CompleteUser } from '../models/zod/userModel';
import GoogleProvider from './providers/googleProvider';
import { ProviderData, ServiceProvider } from './providers/serviceProvider';

export namespace UserService {
    const providers: Record<Provider, ServiceProvider> = {
        [Provider.Google]: new GoogleProvider(),
    };

    function isValidProvider(provider: string): provider is Provider {
        return provider in Provider;
    }

    export async function login(provider: string, token: string): Promise<CompleteUser> {
        if (!isValidProvider(provider)) {
            throw new BadRequestError([
                { path: 'authorization.provider', message: `The login provider ${provider} is not supporter` },
            ]);
        }

        const serviceProvider = providers[provider];
        const providerData = await serviceProvider.extractProviderData(token);
        return await loginWithProvider(provider, providerData);
    }

    async function loginWithProvider(provider: Provider, providerData: ProviderData): Promise<CompleteUser> {
        const userProvider = await prisma.userProvider.findFirst({
            where: { provider, providerId: providerData.providerId },
        });

        if (!userProvider) {
            return await signupWithProvider(provider, providerData);
        }

        return await updateUserData(provider, { ...providerData.data, userId: userProvider.userId });
    }

    async function signupWithProvider(provider: Provider, providerData: ProviderData): Promise<CompleteUser> {
        const user = await prisma.user.create({
            data: {
                isBot: false,
                mainProvider: provider,
            },
        });

        const createUserData = prisma.userData.create({
            data: {
                userId: user.id,
                ...providerData.data,
            },
        });

        const createUserProvider = prisma.userProvider.create({
            data: {
                userId: user.id,
                provider,
                providerId: providerData.providerId,
            },
        });

        const [userData] = await prisma.$transaction([createUserData, createUserProvider]);
        return { ...user, data: userData };
    }

    async function updateUserData(provider: Provider, data: UserData): Promise<CompleteUser> {
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

        if (userDataIsOutdated(user.data, data))
            user.data = await prisma.userData.upsert({
                where: { userId: user.id },
                create: data,
                update: data,
            });

        return user;
    }

    function userDataIsOutdated(currentUserData: UserData | null, newUserData: UserData): boolean {
        return (
            currentUserData === null ||
            currentUserData.username !== newUserData.username ||
            currentUserData.profilePicture !== newUserData.profilePicture
        );
    }
}
