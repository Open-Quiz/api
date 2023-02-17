import { Quiz } from '@prisma/client';

export function canUserAccess(quiz: Quiz, userId: number) {
    return quiz.ownerId === userId || quiz.isPublic || quiz.sharedWithUserIds.includes(userId);
}
