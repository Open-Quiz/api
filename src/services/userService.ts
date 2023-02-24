import { Provider } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../client/instance';
import config from '../config';
import BadRequestError from '../errors/badRequestError';

export namespace UserService {
    const googleClient = new OAuth2Client(config.google.clientId);

    export async function login(provider: string, token: string) {
        switch (provider) {
            case Provider.Google:
                return await loginWithGoogle(token);
            default:
                throw new BadRequestError([
                    { path: 'authorization.provider', message: `The login provider ${provider} is not supporter` },
                ]);
        }
    }

    // Modified from: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
    async function loginWithGoogle(idToken: string) {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: config.google.clientId,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            throw new BadRequestError([
                {
                    path: 'authorization.token',
                    message: 'There was an issue verifying the google id token. The payload is missing.',
                },
            ]);
        }

        const userId = payload.sub;
        return await loginWithProvider(Provider.Google, userId);
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
