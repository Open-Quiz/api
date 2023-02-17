import { Prisma } from '@prisma/client';
import prisma from '../client/instance';
import BadRequestError from '../errors/badRequestError';
import ForbiddenError from '../errors/forbiddenError';
import NotFoundError from '../errors/notFoundError';
import questionDto from '../models/dtos/questionDto';
import { CreateQuestion, UpdateQuestion } from '../models/zod/quizQuestionModel';
import { canUserAccess } from './userService';

export class QuestionService {
    private readonly questionRepository: Prisma.QuizQuestionDelegate<undefined>;

    constructor(questionRepository: Prisma.QuizQuestionDelegate<undefined>) {
        this.questionRepository = questionRepository;
    }

    private async getQuestionWithQuizById(questionId: number) {
        const question = await this.questionRepository.findFirst({
            where: { id: questionId },
            include: { quiz: true },
        });

        if (!question) {
            throw new NotFoundError(`There is no quiz question with the id ${questionId}`);
        }

        return question;
    }

    public async getViewableQuestionById(questionId: number, requesterId: number) {
        const question = await this.getQuestionWithQuizById(questionId);

        if (!canUserAccess(question.quiz, requesterId)) {
            throw new ForbiddenError(`You do not have access to the quiz question ${questionId}`);
        }

        return questionDto(question);
    }

    public async updateQuestionById(questionId: number, requesterId: number, updatedQuestion: UpdateQuestion) {}

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
