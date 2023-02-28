import { Provider } from '@prisma/client';
import { describe, it, expect } from 'vitest';
import { CompleteUser } from '../models/zod/userModel';
import setupTestApp from '../testing/setupTestApp';
import { ProviderData } from './providers/serviceProvider';
import { UserService } from './userService';

setupTestApp();

describe('@Integration - User Service', () => {
    describe('Login with provider', async () => {
        it('signs up a new user if they do not have a linked provider already', async () => {
            const providerData: ProviderData = {
                providerId: '1',
                data: {
                    username: 'Test 1',
                    profilePicture: 'https://example.com/1.png',
                },
            };

            const loginResult = await UserService.loginWithProvider(Provider.Google, providerData);

            expect(loginResult.wasSignedUp).toBeTruthy();
            expect(loginResult.user).toStrictEqual<CompleteUser>({
                id: 1,
                isBot: false,
                mainProvider: Provider.Google,
                data: {
                    userId: 1,
                    username: 'Test 1',
                    profilePicture: 'https://example.com/1.png',
                },
            });
        });
    });
});
