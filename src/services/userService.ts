import { Provider, UserData } from '@prisma/client';
import prisma from '../client/instance';
import UserDeletedError from '../errors/UserDeletedError';
import { CompleteUser } from '../models/zod/userModel';
import LoginResult from '../types/interfaces/loginResult';
import GoogleProvider from './providers/googleProvider';
import { ProviderData, ServiceProvider } from './providers/serviceProvider';

export namespace UserService {
    const providers: Record<Provider, ServiceProvider> = {
        [Provider.Google]: new GoogleProvider(),
    };

    /**
     * Fetches the user with the given id and it's data.
     *
     * @param {number} id The id of the user to fetch
     * @returns {Promise<CompleteUser>} The fetched complete user
     * @throws `UserDeletedError` If the user with the given id does not exist
     */
    export async function getUserByIdWithData(id: number): Promise<CompleteUser> {
        const user = await prisma.user.findFirst({
            where: { id },
            include: { data: true },
        });

        if (!user) {
            throw new UserDeletedError(id);
        }

        return user;
    }

    /**
     * Logs in user with the given provider and that providers respective token. If
     * there is no user linked to the given provider it will create a new user, otherwise,
     * it will return the existing user. It also checks that the user's data is up to date
     * and updates it if necessary.
     *
     * @param {Provider} provider The provider to use for login
     * @param {string} token The providers respective token
     * @returns {Promise<LoginResult>} The complete user that was logged in and whether they were signed up
     * @throws `BadRequestError` If something went wrong while extracting the provider data
     * @throws `UserDeletedError` If there is a user provider but no user. This can happen if
     *         the user was deleted just before the user was fetched.
     */
    export async function login(provider: Provider, token: string): Promise<LoginResult> {
        const serviceProvider = providers[provider];
        const providerData = await serviceProvider.extractProviderData(token);
        return await loginWithProvider(provider, providerData);
    }

    /**
     * Links the provider to the user with the given id. If the `makeMainProvider` argument
     * is true it will also update the user's main provider to the given provider. In this case,
     * or if the user data is outdated, it also updates the user's data to match the new provider.
     *
     * @param {number} userId The user id to link the provider to
     * @param {Provider} provider The provider to link
     * @param {string} token The provider's respective token
     * @param {boolean} makeMainProvider If the provider should be set to the user's main provider
     * @returns {Promise<CompleteUser>} The complete user that was linked to the provider
     * @throws `UserDeletedError` If the user with the given id does not exist
     */
    export async function linkProvider(
        userId: number,
        provider: Provider,
        token: string,
        makeMainProvider: boolean,
    ): Promise<CompleteUser> {
        const serviceProvider = providers[provider];
        const providerData = await serviceProvider.extractProviderData(token);

        const user = await getUserByIdWithData(userId);

        await prisma.userProvider.upsert({
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

        if (
            (makeMainProvider && user.mainProvider !== provider) ||
            isUserDataIsOutdated(user.data, providerData.data)
        ) {
            await prisma.userData.upsert({
                where: { userId },
                create: { ...providerData.data, userId },
                update: providerData.data,
            });

            if (makeMainProvider && user.mainProvider !== provider) {
                return await prisma.user.update({
                    where: { id: userId },
                    data: { mainProvider: provider },
                    include: { data: true },
                });
            }
        }

        return user;
    }

    export function isValidProvider(provider: string): provider is Provider {
        return provider in Provider;
    }

    async function loginWithProvider(provider: Provider, providerData: ProviderData): Promise<LoginResult> {
        const userProvider = await prisma.userProvider.findFirst({
            where: { provider, providerId: providerData.providerId },
        });

        if (!userProvider) {
            return { user: await signupWithProvider(provider, providerData), wasSignedUp: true };
        }

        return {
            user: await updateUserData(provider, { ...providerData.data, userId: userProvider.userId }),
            wasSignedUp: false,
        };
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

        if (isUserDataIsOutdated(user.data, data))
            user.data = await prisma.userData.upsert({
                where: { userId: user.id },
                create: data,
                update: data,
            });

        return user;
    }

    function isUserDataIsOutdated(
        currentUserData: Omit<UserData, 'userId'> | null,
        newUserData: Omit<UserData, 'userId'>,
    ): boolean {
        return (
            currentUserData === null ||
            currentUserData.username !== newUserData.username ||
            currentUserData.profilePicture !== newUserData.profilePicture
        );
    }
}
