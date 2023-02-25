import { OAuth2Client } from 'google-auth-library';
import config from '../../config';
import BadRequestError from '../../errors/badRequestError';
import { ProviderData, ServiceProvider } from './serviceProvider';

export default class GoogleProvider implements ServiceProvider {
    private readonly googleClient = new OAuth2Client(config.google.clientId);

    // Modified from: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
    async extractProviderData(idToken: string): Promise<ProviderData> {
        const ticket = await this.googleClient.verifyIdToken({
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

        return {
            providerId: payload.sub,
            data: {
                username: payload.name ?? null,
                profilePicture: payload.picture ?? null,
            },
        };
    }
}
