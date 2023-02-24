import { Quiz } from '@prisma/client';

export namespace AccessService {
    export function canUserAccess(quiz: Quiz, userId: number) {
        return quiz.isPublic || quiz.ownerId === userId || quiz.sharedWithUserIds.includes(userId);
    }

    export function canUserModify(quiz: Quiz, userId: number) {
        return quiz.ownerId === userId;
    }
}
