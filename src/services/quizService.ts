import { Prisma } from '@prisma/client';
import prisma from '../client/instance';
import BadRequestError from '../errors/badRequestError';
import ForbiddenError from '../errors/forbiddenError';
import NotFoundError from '../errors/notFoundError';
import { CreateQuiz, UpdateQuiz } from '../models/zod/quizModel';
import { CreateQuestion } from '../models/zod/questionModel';
import questionService, { QuestionService } from './questionService';
import accessService, { AccessService } from './accessService';

export class QuizService {
    constructor(
        private readonly userRepository: Prisma.UserDelegate<undefined>,
        private readonly quizRepository: Prisma.QuizDelegate<undefined>,
        private readonly questionService: QuestionService,
        private readonly accessService: AccessService,
    ) {}

    public async getAllViewableQuizzes(userId: number) {
        const allQuizzes = await this.quizRepository.findMany({
            include: { questions: true },
            where: {
                OR: [{ ownerId: userId }, { isPublic: true }, { sharedWithUserIds: { has: userId } }],
            },
        });

        return allQuizzes;
    }

    public async getQuizById(quizId: number) {
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

    public async getViewableQuizById(quizId: number, requesterId: number) {
        const quiz = await this.getQuizById(quizId);

        if (!this.accessService.canUserAccess(quiz, requesterId)) {
            throw new ForbiddenError(`You do not have access to the quiz ${quizId}`);
        }

        return quiz;
    }

    public async createQuiz({ questions = [], sharedWithUserIds = [], ...other }: CreateQuiz, ownerId: number) {
        this.questionService.validateQuestions(questions);

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

    public async appendQuizQuestionsById(quizId: number, questions: CreateQuestion[]) {
        this.questionService.validateQuestions(questions);

        return await this.quizRepository.update({
            where: { id: quizId },
            data: {
                questions: {
                    createMany: {
                        data: questions,
                    },
                },
            },
            include: { questions: true },
        });
    }

    public async updateQuizById(quizId: number, requesterId: number, updateQuiz: UpdateQuiz) {
        if (updateQuiz.sharedWithUserIds) {
            updateQuiz.sharedWithUserIds = await this.validateSharedWithUserIds(
                updateQuiz.sharedWithUserIds,
                requesterId,
            );
        }

        return await this.quizRepository.update({
            where: { id: quizId },
            data: updateQuiz,
            include: { questions: true },
        });
    }

    public async deleteQuizById(quizId: number) {
        await this.quizRepository.delete({
            where: { id: quizId },
        });
    }

    public async validateSharedWithUserIds(sharedWithUserIds: number[], requesterId: number) {
        const distinctSharedWithUserIds = [...new Set(sharedWithUserIds.filter((userId) => userId !== requesterId))];

        const sharedWithUserIdsThatExist = (
            await this.userRepository.findMany({
                where: {
                    id: { in: distinctSharedWithUserIds },
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

const singleton = new QuizService(prisma.user, prisma.quiz, questionService, accessService);
export default singleton;
