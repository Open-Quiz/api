import { Quiz } from '@prisma/client';
import { beforeAll, describe, expect, it } from 'vitest';
import { AccessService } from './accessService';

describe('@Unit - Access Service', () => {
    const mockQuiz: Omit<Quiz, 'ownerId' | 'isPublic' | 'sharedWithUserIds'> = {
        id: 1,
        title: 'Test Quiz',
    };

    let accessService: AccessService;

    beforeAll(() => {
        accessService = new AccessService();
    });

    describe('Can user access', async () => {
        it('allows any user to access a public quiz', async () => {
            const canAccess = accessService.canUserAccess(
                {
                    ...mockQuiz,
                    isPublic: true,
                    ownerId: 1,
                    sharedWithUserIds: [],
                },
                2,
            );

            expect(canAccess).toBeTruthy();
        });

        it('allows a user to access a quiz they are the owner of', async () => {
            const canAccess = accessService.canUserAccess(
                {
                    ...mockQuiz,
                    isPublic: false,
                    ownerId: 1,
                    sharedWithUserIds: [],
                },
                1,
            );

            expect(canAccess).toBeTruthy();
        });

        it('allows a user to access a quiz shared with them', async () => {
            const canAccess = accessService.canUserAccess(
                {
                    ...mockQuiz,
                    isPublic: false,
                    ownerId: 1,
                    sharedWithUserIds: [2],
                },
                2,
            );

            expect(canAccess).toBeTruthy();
        });

        it("doesn't allow a user to access a quiz not public, they're not the owner of and one not shared with them", async () => {
            const canAccess = accessService.canUserAccess(
                {
                    ...mockQuiz,
                    isPublic: false,
                    ownerId: 1,
                    sharedWithUserIds: [],
                },
                2,
            );

            expect(canAccess).toBeFalsy();
        });
    });

    describe('Can user modify', async () => {
        it('allows a user to modify a quiz they are the owner of', async () => {
            const canModify = accessService.canUserModify(
                {
                    ...mockQuiz,
                    isPublic: false,
                    ownerId: 1,
                    sharedWithUserIds: [],
                },
                1,
            );

            expect(canModify).toBeTruthy();
        });

        it("doesn't allow a user to modify a quiz they are not the owner of", async () => {
            const canModify = accessService.canUserModify(
                {
                    ...mockQuiz,
                    isPublic: false,
                    ownerId: 1,
                    sharedWithUserIds: [],
                },
                2,
            );

            expect(canModify).toBeFalsy();
        });
    });
});
