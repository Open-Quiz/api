import { Request, Response } from 'express';
import prisma from '../client';
import IdParam from '../types/idParam';
import { CreateQuiz } from '../zod';

export async function getAllQuizzes(req: Request, res: Response) {
    const allQuizzes = await prisma.quiz.findMany();

    res.ok(allQuizzes);
}

export async function getQuiz(req: Request<IdParam>, res: Response) {
    const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });

    if (!quiz) {
        return res.notFound(`There is no quiz with the id ${req.params.id}`);
    }

    res.ok(quiz);
}

export async function createQuiz(req: Request<unknown, unknown, CreateQuiz>, res: Response) {
    console.log(req.body);
    const newQuiz = await prisma.quiz.create({
        data: req.body,
    });

    res.ok(newQuiz);
}
