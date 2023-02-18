import { Quiz } from '@prisma/client';

export class AccessService {
    public canUserAccess(quiz: Quiz, userId: number) {
        return quiz.isPublic || quiz.ownerId === userId || quiz.sharedWithUserIds.includes(userId);
    }

    public canUserModify(quiz: Quiz, userId: number) {
        return quiz.ownerId === userId;
    }
}

const singleton = new AccessService();
export default singleton;
