import { Provider } from '@prisma/client';
import prisma from '../client/instance';
import BadRequestError from '../errors/badRequestError';
import GoogleProvider from './providers/googleProvider';
import { ServiceProvider } from './providers/serviceProvider';

export namespace UserService {
    const providers: Record<Provider, ServiceProvider> = {
        [Provider.Google]: new GoogleProvider(),
    };

    function isValidProvider(provider: string): provider is Provider {
        return provider in Provider;
    }

    export async function login(provider: string, token: string) {
        if (!isValidProvider(provider)) {
            throw new BadRequestError([
                { path: 'authorization.provider', message: `The login provider ${provider} is not supporter` },
            ]);
        }

        const serviceProvider = providers[provider];
        const providerId = await serviceProvider.extractProviderId(token);
        return await loginWithProvider(provider, providerId);
    }

    async function loginWithProvider(provider: Provider, providerId: string) {
        const userProvider = await prisma.userProvider.findFirst({
            where: { provider, providerId },
            include: { user: true },
        });

        if (!userProvider) {
            // If there isn't a user provider already, then this is the first
            // time they've logged in so we need to create a new user for them.
            const user = await prisma.user.create({
                data: {
                    isBot: false,
                    mainProvider: provider,
                },
            });

            await prisma.userProvider.create({
                data: {
                    userId: user.id,
                    provider,
                    providerId,
                },
            });

            return user;
        }

        return userProvider.user;
    }
}
