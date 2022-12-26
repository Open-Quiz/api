import { Request, Response } from 'express';
import prisma from '../client';
import IdParam from '../types/IdParam';

export async function getAllQuizzes(req: Request, res: Response) {
    const allQuizzes = await prisma.quiz.findMany();

    res.status(200).json(allQuizzes);
}

export async function getQuiz(req: Request<IdParam>, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: `The quiz id must be a number` });
    }

    const quiz = await prisma.quiz.findUnique({ where: { id } });

    if (!quiz) {
        return res.status(404).json({ error: `There is no quiz with the id ${req.params.id}` });
    }

    res.status(200).json(quiz);
}
