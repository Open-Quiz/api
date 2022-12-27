import { Quiz } from '@prisma/client';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import prisma from '../client';
import IdParam from '../types/IdParam';
import { CreateQuiz, CreateQuizModel } from '../zod';

export async function getAllQuizzes(req: Request, res: Response) {
    const allQuizzes = await prisma.quiz.findMany();

    res.ok(allQuizzes);
}

export async function getQuiz(req: Request<IdParam>, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.badRequest(`The quiz id must be a number`);
    }

    const quiz = await prisma.quiz.findUnique({ where: { id } });

    if (!quiz) {
        return res.notFound(`There is no quiz with the id ${req.params.id}`);
    }

    res.ok(quiz);
}

export async function createQuiz(req: Request<unknown, unknown, CreateQuiz>, res: Response) {
    const quiz = req.body;
    const newQuiz = await prisma.quiz.create({
        data: {
            question: quiz.question,
            options: quiz.options,
            correctOption: quiz.correctOption,
        },
    });

    res.ok(newQuiz);
}
