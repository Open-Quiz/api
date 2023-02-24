import { OAuth2Client } from 'google-auth-library';
import config from '../config';
import BadRequestError from '../errors/badRequestError';

export namespace UserService {
    const googleClient = new OAuth2Client(config.google.clientId);
    const supportedProviders = ['google'];

    export async function login(provider: string, token: string) {
        provider = provider.toLocaleLowerCase();

        if (supportedProviders.indexOf(provider) === -1) {
            throw new BadRequestError([
                { path: 'authorization.provider', message: `The login provider ${provider} is not supporter` },
            ]);
        }

        switch (provider) {
            case 'google':
                return await loginWithGoogle(token);
        }
    }

    // Modified from: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
    export async function loginWithGoogle(idToken: string) {
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
    }
}
