import { Prisma, QuizQuestion } from '@prisma/client';
import prisma from '../client/instance';
import BadRequestError from '../errors/badRequestError';
import NotFoundError from '../errors/notFoundError';
import { CreateQuestion, UpdateQuestion, UpdateQuestionStats } from '../models/zod/questionModel';

export class QuestionService {
    constructor(private readonly questionRepository: Prisma.QuizQuestionDelegate<undefined>) {}

    public async getQuestionWithQuizById(questionId: number) {
        const question = await this.questionRepository.findFirst({
            where: { id: questionId },
            include: { quiz: true },
        });

        if (!question) {
            throw new NotFoundError(`There is no quiz question with the id ${questionId}`);
        }

        return question;
    }

    public async getQuestionsWithQuizById(questionIds: number[]) {
        const questions = await this.questionRepository.findMany({
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

    public async updateQuestionById(currentQuestion: QuizQuestion, questionId: number, updateQuestion: UpdateQuestion) {
        const tempUpdatedQuestion = { ...currentQuestion, ...updateQuestion };

        this.validateQuestion(tempUpdatedQuestion);

        return await this.questionRepository.update({
            where: { id: questionId },
            data: updateQuestion,
        });
    }

    public async updateQuestionStats(questionId: number, updateQuestionStats: UpdateQuestionStats) {
        return await this.questionRepository.update({
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

    public async deleteQuestion(questionId: number) {
        await this.questionRepository.delete({
            where: { id: questionId },
        });
    }

    public async deleteQuestions(questionIds: number[]) {
        const result = await this.questionRepository.deleteMany({
            where: {
                id: {
                    in: questionIds,
                },
            },
        });

        return result.count;
    }

    public validateQuestion(question: CreateQuestion) {
        if (question.correctOption >= question.options.length) {
            throw new BadRequestError([
                {
                    path: 'correctOption',
                    message: 'The correct option must be an index of options',
                },
            ]);
        }
    }

    public validateQuestions(questions: CreateQuestion[]) {
        for (const question of questions) {
            this.validateQuestion(question);
        }
    }
}

const singleton = new QuestionService(prisma.quizQuestion);
export default singleton;
