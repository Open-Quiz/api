import { Provider } from '@prisma/client';
import { describe, it, expect, beforeAll } from 'vitest';
import prisma from '../client/instance';
import { CompleteUser } from '../models/zod/userModel';
import setupTestApp from '../testing/setupTestApp';
import LoginResult from '../types/interfaces/loginResult';
import { ProviderData } from './providers/serviceProvider';
import { UserService } from './userService';

setupTestApp();

describe('@Integration - User Service', () => {
    let user: CompleteUser;

    beforeAll(async () => {
        user = await prisma.user.create({
            data: {
                isBot: false,
                mainProvider: Provider.Google,
                data: {
                    create: {
                        username: 'Test 1',
                        profilePicture: 'https://example.com/1.png',
                    },
                },
                providers: {
                    create: {
                        provider: Provider.Google,
                        providerId: '1',
                    },
                },
            },
            include: { data: true },
        });
    });

    describe('Login with provider', async () => {
        it('logs you in with the existing user if they are already linked to the provider', async () => {
            const providerData: ProviderData = {
                providerId: '1',
                data: {
                    username: 'Test 1',
                    profilePicture: 'https://example.com/1.png',
                },
            };

            const loginResult = await UserService.loginWithProvider(Provider.Google, providerData);

            expect(loginResult).toStrictEqual<LoginResult>({
                wasSignedUp: false,
                user,
            });
        });

        it('signs up a new user if they do not have a linked provider already', async () => {
            const providerData: ProviderData = {
                providerId: '2',
                data: {
                    username: 'Test 2',
                    profilePicture: 'https://example.com/2.png',
                },
            };

            const loginResult = await UserService.loginWithProvider(Provider.Google, providerData);

            expect(loginResult).toStrictEqual<LoginResult>({
                wasSignedUp: true,
                user: {
                    id: 2,
                    isBot: false,
                    mainProvider: Provider.Google,
                    data: {
                        userId: 2,
                        username: 'Test 2',
                        profilePicture: 'https://example.com/2.png',
                    },
                },
            });
        });

        it('updates the user data if it has become outdated', async () => {
            const providerData: ProviderData = {
                providerId: '1',
                data: {
                    username: 'Test 1 Updated',
                    profilePicture: 'https://example.com/1.png',
                },
            };

            const loginResult = await UserService.loginWithProvider(Provider.Google, providerData);

            const updatedUser = { ...user, data: { userId: 1, ...providerData.data } };

            expect(loginResult).toStrictEqual<LoginResult>({
                wasSignedUp: false,
                user: updatedUser,
            });

            user = updatedUser;
        });
    });
});
