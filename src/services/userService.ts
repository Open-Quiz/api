import { Provider } from '@prisma/client';
import prisma from '../client/instance';
import UserDeletedError from '../errors/UserDeletedError';
import { CompleteUser } from '../models/zod/userModel';
import LoginResult from '../types/interfaces/loginResult';
import GoogleProvider from './providers/googleProvider';
import { ProviderData, ServiceProvider } from './providers/serviceProvider';
import { UserDataService } from './userDataService';
import { UserProviderService } from './userProviderService';

export namespace UserService {
    const providers: Record<Provider, ServiceProvider> = {
        [Provider.Google]: new GoogleProvider(),
    };

    /**
     * Fetches the user with the given id and it's data.
     *
     * @param {number} id The id of the user to fetch
     * @returns {Promise<CompleteUser>} The fetched complete user
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
        const updateMainProvider = makeMainProvider && user.mainProvider !== provider;

        await UserProviderService.createOrUpdateUserProvider(userId, provider, providerData);

        if (updateMainProvider || UserDataService.isUserDataIsOutdated(user.data, providerData.data)) {
            await UserDataService.updateUserData(userId, { ...providerData.data, userId });

            if (updateMainProvider) {
                return await prisma.user.update({
                    where: { id: userId },
                    data: { mainProvider: provider },
                    include: { data: true },
                });
            }
        }

        return user;
    }

    /**
     * Checks whether the given string is a valid provider and types it as such if it is.
     *
     * @param {string} provider The string to check
     * @returns {boolean} Whether the given string is a valid provider
     */
    export function isValidProvider(provider: string): provider is Provider {
        return provider in Provider;
    }

    /**
     * Deletes the user with the given id.
     *
     * @param userId The id of the user to delete
     */
    export async function deleteUser(userId: number): Promise<void> {
        await prisma.user.delete({ where: { id: userId } });
    }

    /**
     * Logs in with the given provider and it's extracted data. If there is no user linked to that
     * provider then it will create a new user and link the provider to it. Otherwise, it checks if
     * the user data is outdated and updates it if necessary.
     *
     * @param {Provider} provider The used to login
     * @param {ProviderData} providerData The extracted data from the provider
     * @returns {Promise<LoginResult>} The user that was logged in and whether they were just signed up
     */
    export async function loginWithProvider(provider: Provider, providerData: ProviderData): Promise<LoginResult> {
        const userProvider = await prisma.userProvider.findFirst({
            where: { provider, providerId: providerData.providerId },
        });

        if (!userProvider) {
            return { user: await signUpWithProvider(provider, providerData), wasSignedUp: true };
        }

        return {
            user: await UserDataService.updateUserDataIfOutdated(provider, {
                ...providerData.data,
                userId: userProvider.userId,
            }),
            wasSignedUp: false,
        };
    }

    /**
     * Signs up a new user with the given provider and it's extracted data.
     *
     * @param {Provider} provider The provider to use for sign up
     * @param {ProviderData} providerData The extracted data from the provider
     * @returns {Promise<CompleteUser>}  The user created after signing up
     */
    async function signUpWithProvider(provider: Provider, providerData: ProviderData): Promise<CompleteUser> {
        const user = await prisma.user.create({
            data: {
                isBot: false,
                mainProvider: provider,
            },
        });

        const [userData] = await UserProviderService.createUserDataAndProvider(user.id, provider, providerData);
        return { ...user, data: userData };
    }
}
