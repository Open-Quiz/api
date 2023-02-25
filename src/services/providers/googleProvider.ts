import { OAuth2Client } from 'google-auth-library';
import config from '../../config';
import BadRequestError from '../../errors/badRequestError';
import { ServiceProvider } from './serviceProvider';

export default class GoogleProvider implements ServiceProvider {
    private readonly googleClient = new OAuth2Client(config.google.clientId);

    // Modified from: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
    async extractProviderId(idToken: string): Promise<string> {
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

        const userId = payload.sub;
        return userId;
    }
}
