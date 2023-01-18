import { Prisma, Quiz } from '@prisma/client';

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
            ],
        };
    }

    export function canUserAccess(quiz: Quiz, userId: number): boolean {
        return quiz.ownerId === userId || quiz.isPublic;
    }
}
