import { Prisma, Quiz } from '@prisma/client';
import prisma from '../client/instance';
import BadRequestError from '../errors/badRequestError';
import ForbiddenError from '../errors/forbiddenError';
import NotFoundError from '../errors/notFoundError';
import quizDto from '../models/dtos/quizDto';
import { CompleteCreateQuiz } from '../models/zod/quizModel';
import { isNotUndefined } from '../utility/typing';
import { PatchQuiz } from '../zod';
import { QuizQuestionService } from './quizQuestionService';

class QuizService {
    private readonly userRepository: Prisma.UserDelegate<undefined>;
    private readonly quizRepository: Prisma.QuizDelegate<undefined>;

    constructor(userRepository: Prisma.UserDelegate<undefined>, quizRepository: Prisma.QuizDelegate<undefined>) {
        this.userRepository = userRepository;
        this.quizRepository = quizRepository;
    }

    public async getViewableQuizzes(userId: number) {
        const allQuizzes = await this.quizRepository.findMany({
            include: { questions: true },
            where: {
                OR: [{ ownerId: userId }, { isPublic: true }, { sharedWithUserIds: { has: userId } }],
            },
        });

        return allQuizzes;
    }

    public async getQuiz(quizId: number) {
        const quiz = await this.quizRepository.findFirst({
            where: {
                id: quizId,
            },
            include: { questions: true },
        });

        if (!quiz) {
            throw new NotFoundError(`There is no quiz with the id ${quizId}`);
        }

        return quiz;
    }

    public async getViewableQuiz(quizId: number, requesterId: number) {
        const quiz = await this.getQuiz(quizId);

        if (!this.canUserAccess(quiz, requesterId)) {
            throw new ForbiddenError(`You do not have access to the quiz ${quizId}`);
        }

        return quiz;
    }

    public async createQuiz({ questions = [], sharedWithUserIds = [], ...other }: CompleteCreateQuiz, ownerId: number) {
        const errors = questions
            .map(QuizQuestionService.isInvalid)
            .map((error, index) => (error ? { ...error, path: `questions.${index}.${error.path}` } : undefined))
            .filter(isNotUndefined);

        if (errors.length !== 0) {
            throw new BadRequestError(errors);
        }

        sharedWithUserIds = await this.validateSharedWithUserIds(sharedWithUserIds, ownerId);

        const newQuiz = await this.quizRepository.create({
            data: {
                ...other,
                ownerId,
                sharedWithUserIds,
                questions: {
                    createMany: {
                        data: questions,
                    },
                },
            },
            include: { questions: true },
        });

        return newQuiz;
    }

    public async updateQuiz(quizId: number, requesterId: number, patchQuiz: PatchQuiz) {
        if (patchQuiz.sharedWithUserIds) {
            patchQuiz.sharedWithUserIds = await this.validateSharedWithUserIds(
                patchQuiz.sharedWithUserIds,
                requesterId,
            );
        }

        return await this.quizRepository.update({
            where: { id: quizId },
            data: patchQuiz,
            include: { questions: true },
        });
    }

    public async deleteQuiz(quizId: number) {
        await this.quizRepository.delete({
            where: { id: quizId },
        });
    }

    public canUserAccess(quiz: Quiz, userId: number) {
        return quiz.ownerId === userId || quiz.isPublic || quiz.sharedWithUserIds.includes(userId);
    }

    public async validateSharedWithUserIds(sharedWithUserIds: number[], requesterId: number) {
        const distinctSharedWithUserIds = [...new Set(sharedWithUserIds.filter((userId) => userId !== requesterId))];

        const sharedWithUserIdsThatExist = (
            await this.userRepository.findMany({
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

const singleton = new QuizService(prisma.user, prisma.quiz);
export default singleton;
