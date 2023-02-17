import { Prisma } from '@prisma/client';
import prisma from '../client/instance';
import BadRequestError from '../errors/badRequestError';
import ForbiddenError from '../errors/forbiddenError';
import NotFoundError from '../errors/notFoundError';
import questionDto from '../models/dtos/questionDto';
import { CreateQuestion, UpdateQuestion, UpdateQuestionStats } from '../models/zod/questionModel';
import { canUserAccess } from './userService';

export class QuestionService {
    private readonly questionRepository: Prisma.QuizQuestionDelegate<undefined>;

    constructor(questionRepository: Prisma.QuizQuestionDelegate<undefined>) {
        this.questionRepository = questionRepository;
    }

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
            const nonExistentIds = questions.map((question) => question.id).filter((id) => !questionIds.includes(id));
            throw new NotFoundError(`There is no quiz question with the ids ${nonExistentIds}`);
        }

        return questions;
    }

    public async getViewableQuestionById(questionId: number, requesterId: number) {
        const question = await this.getQuestionWithQuizById(questionId);

        if (!canUserAccess(question.quiz, requesterId)) {
            throw new ForbiddenError(`You do not have access to the quiz question ${questionId}`);
        }

        return questionDto(question);
    }

    public async updateQuestionById(questionId: number, updatedQuestion: UpdateQuestion) {
        return await this.questionRepository.update({
            where: { id: questionId },
            data: updatedQuestion,
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

    public async deleteQuestion(questionId: number) {
        await this.questionRepository.delete({
            where: { id: questionId },
        });
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
