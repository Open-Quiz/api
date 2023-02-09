import { Prisma, Quiz } from '@prisma/client';
import prisma from '../client/instance';
import BadRequestError from '../errors/badRequestError';

export namespace QuizService {
    export function whereUserCanAccess(userId: number): Prisma.QuizWhereInput {
        return {
            OR: [
                {
                    ownerId: userId,
                },
                {
                    isPublic: true,
                },
                {
                    sharedWithUserIds: {
                        has: userId,
                    },
                },
            ],
        };
    }

    export function canUserAccess(quiz: Quiz, userId: number) {
        return quiz.ownerId === userId || quiz.isPublic || quiz.sharedWithUserIds.includes(userId);
    }

    export async function validateSharedWithUserIds(sharedWithUserIds: number[], requesterId: number) {
        const distinctSharedWithUserIds = [...new Set(sharedWithUserIds.filter((userId) => userId !== requesterId))];

        const sharedWithUserIdsThatExist = (
            await prisma.user.findMany({
                where: {
                    id: {
                        in: distinctSharedWithUserIds,
                    },
                },
            })
        ).map((user) => user.id);

        if (distinctSharedWithUserIds.length !== sharedWithUserIdsThatExist.length) {
            const invalidUserIds = distinctSharedWithUserIds.filter(
                (userId) => !sharedWithUserIdsThatExist.includes(userId),
            );

            throw new BadRequestError([
                { path: 'sharedWithUserIds', message: `The user ids ${invalidUserIds} don't exist` },
            ]);
        }

        return distinctSharedWithUserIds;
    }
}
