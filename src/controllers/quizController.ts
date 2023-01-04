import { Quiz } from '@prisma/client';
import { Request, Response } from 'express';
import prisma from '../client/instance';
import { CompleteCreateQuiz } from '../models/zod/createQuizModel';
import IdParam from '../types/idParam';

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
    const newQuiz = await prisma.quiz.create({
        data: {
            title: req.body.title,
            isPublic: req.body.isPublic,
            quizzes: {
                createMany: {
                    data: req.body.quizzes ?? [],
                },
            },
        },
        include: { quizzes: true },
    });

    return res.created(newQuiz);
}
