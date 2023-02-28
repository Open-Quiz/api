import prisma from '../client/instance';
import BadRequestError from '../errors/badRequestError';
import ForbiddenError from '../errors/forbiddenError';
import NotFoundError from '../errors/notFoundError';
import { CompleteQuiz, CreateQuiz, UpdateQuiz } from '../models/zod/quizModel';
import { CreateQuestion } from '../models/zod/questionModel';
import { QuestionService } from './questionService';
import { AccessService } from './accessService';

export namespace QuizService {
    export async function getAllViewableQuizzes(userId: number): Promise<CompleteQuiz[]> {
        const allQuizzes = await prisma.quiz.findMany({
            include: { questions: true },
            where: {
                OR: [{ ownerId: userId }, { isPublic: true }, { sharedWithUserIds: { has: userId } }],
            },
        });

        return allQuizzes;
    }

    export async function getQuizById(quizId: number): Promise<CompleteQuiz> {
        const quiz = await prisma.quiz.findFirst({
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

    export async function getViewableQuizById(quizId: number, requesterId: number): Promise<CompleteQuiz> {
        const quiz = await getQuizById(quizId);

        if (!AccessService.canUserAccess(quiz, requesterId)) {
            throw new ForbiddenError(`You do not have access to the quiz ${quizId}`);
        }

        return quiz;
    }

    export async function createQuiz(
        { questions = [], sharedWithUserIds = [], ...other }: CreateQuiz,
        ownerId: number,
    ): Promise<CompleteQuiz> {
        QuestionService.validateQuestions(questions);

        sharedWithUserIds = await validateSharedWithUserIds(sharedWithUserIds, ownerId);

        const newQuiz = await prisma.quiz.create({
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

    export async function appendQuizQuestionsById(quizId: number, questions: CreateQuestion[]): Promise<CompleteQuiz> {
        QuestionService.validateQuestions(questions);

        return await prisma.quiz.update({
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

    export async function updateQuizById(
        quizId: number,
        requesterId: number,
        updateQuiz: UpdateQuiz,
    ): Promise<CompleteQuiz> {
        if (updateQuiz.sharedWithUserIds) {
            updateQuiz.sharedWithUserIds = await validateSharedWithUserIds(updateQuiz.sharedWithUserIds, requesterId);
        }

        return await prisma.quiz.update({
            where: { id: quizId },
            data: updateQuiz,
            include: { questions: true },
        });
    }

    export async function deleteQuizById(quizId: number): Promise<void> {
        await prisma.quiz.delete({
            where: { id: quizId },
        });
    }

    export async function validateSharedWithUserIds(
        sharedWithUserIds: number[],
        requesterId: number,
    ): Promise<number[]> {
        const distinctSharedWithUserIds = [...new Set(sharedWithUserIds.filter((userId) => userId !== requesterId))];

        const sharedWithUserIdsThatExist = (
            await prisma.user.findMany({
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
