import { Quiz } from '@prisma/client';
import { Request, Response } from 'express';
import prisma from '../client/instance';
import { CompleteCreateQuiz } from '../models/zod/createQuizModel';
import { QuizQuestionService } from '../services/QuizQuestionService';
import IdParam from '../types/idParam';
import { BadRequestError } from '../types/response';
import { isNotUndefined } from '../utils/typing';

export async function getAllQuizzes(req: Request, res: Response) {
    const allQuizzes = await prisma.quiz.findMany();

    return res.ok(allQuizzes);
}

export async function getQuiz(req: Request<IdParam>, res: Response) {
    const quiz = await prisma.quiz.findFirst({ where: { id: req.params.id } });

    if (!quiz) {
        return res.notFound(`There is no quiz with the id ${req.params.id}`);
    }

    return res.ok(quiz);
}

export async function createQuiz(req: Request<unknown, unknown, CompleteCreateQuiz>, res: Response) {
    const { title, isPublic, quizzes = [] } = req.body;

    const errors = quizzes
        .map(QuizQuestionService.isInValid)
        .map((error, index) => (error ? { ...error, path: `quizzes.${index}.${error.path}` } : undefined))
        .filter(isNotUndefined);

    if (errors.length !== 0) {
        return res.badRequest(errors);
    }

    const newQuiz = await prisma.quiz.create({
        data: {
            title,
            isPublic,
            quizzes: {
                createMany: {
                    data: quizzes,
                },
            },
        },
        include: { quizzes: true },
    });

    return res.created(newQuiz);
}
