import { QuizQuestion } from '@prisma/client';
import prisma from '../client/instance';
import BadRequestError from '../errors/badRequestError';
import NotFoundError from '../errors/notFoundError';
import { CreateQuestion, UpdateQuestion, UpdateQuestionStats } from '../models/zod/questionModel';

export namespace QuestionService {
    export async function getQuestionWithQuizById(questionId: number) {
        const question = await prisma.quizQuestion.findFirst({
            where: { id: questionId },
            include: { quiz: true },
        });

        if (!question) {
            throw new NotFoundError(`There is no quiz question with the id ${questionId}`);
        }

        return question;
    }

    export async function getQuestionsWithQuizById(questionIds: number[]) {
        const questions = await prisma.quizQuestion.findMany({
            where: {
                id: { in: questionIds },
            },
            include: { quiz: true },
        });

        if (questions.length !== questionIds.length) {
            const foundQuestionIds = questions.map((question) => question.id);
            const nonExistentIds = questionIds.filter((id) => !foundQuestionIds.includes(id));
            throw new NotFoundError(`There is no quiz question with the ids ${nonExistentIds}`);
        }

        return questions;
    }

    export async function updateQuestionById(
        currentQuestion: QuizQuestion,
        questionId: number,
        updateQuestion: UpdateQuestion,
    ) {
        const tempUpdatedQuestion = { ...currentQuestion, ...updateQuestion };

        validateQuestion(tempUpdatedQuestion);

        return await prisma.quizQuestion.update({
            where: { id: questionId },
            data: updateQuestion,
        });
    }

    export async function updateQuestionStats(questionId: number, updateQuestionStats: UpdateQuestionStats) {
        return await prisma.quizQuestion.update({
            where: { id: questionId },
            data: {
                totalCorrectAttempts: {
                    increment: updateQuestionStats.incrementCorrectAttempts ?? 0,
                },
                totalIncorrectAttempts: {
                    increment: updateQuestionStats.incrementIncorrectAttempts ?? 0,
                },
            },
        });
    }

    export async function deleteQuestion(questionId: number) {
        await prisma.quizQuestion.delete({
            where: { id: questionId },
        });
    }

    export async function deleteQuestions(questionIds: number[]) {
        const result = await prisma.quizQuestion.deleteMany({
            where: {
                id: {
                    in: questionIds,
                },
            },
        });

        return result.count;
    }

    export function validateQuestion(question: CreateQuestion) {
        if (question.correctOption >= question.options.length) {
            throw new BadRequestError([
                {
                    path: 'correctOption',
                    message: 'The correct option must be an index of options',
                },
            ]);
        }
    }

    export function validateQuestions(questions: CreateQuestion[]) {
        for (const question of questions) {
            validateQuestion(question);
        }
    }
}
