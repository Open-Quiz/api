import { Quiz, Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import prisma from '../client';
import { IdArray } from '../models/zod/idModel';
import IdParam from '../types/idParam';
import { DEFAULT } from '../utils/postgres';
import { CreateQuiz, PatchQuiz } from '../zod';

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
    const newQuiz = await prisma.quiz.create({
        data: req.body,
    });

    res.created(newQuiz);
}

export async function createQuizzes(req: Request<unknown, unknown, CreateQuiz[]>, res: Response) {
    const values = req.body.map(
        (quiz) => Prisma.sql`(${quiz.question}, ${quiz.options}, ${quiz.correctOption ?? DEFAULT})`,
    );

    const newQuizzes = await prisma.$queryRaw<Quiz[]>`INSERT INTO public."Quiz"
        (question, options, "correctOption")
    VALUES
        ${Prisma.join(values)} 
    RETURNING *`;

    res.created(newQuizzes);
}

export async function updateQuiz(req: Request<IdParam, unknown, PatchQuiz>, res: Response) {
    const updatedQuiz = await prisma.quiz.update({
        where: { id: req.params.id },
        data: req.body,
    });

    res.ok(updatedQuiz);
}

export async function deleteQuiz(req: Request<IdParam>, res: Response) {
    try {
        await prisma.quiz.delete({
            where: { id: req.params.id },
        });
    } catch (err) {
        return res.badRequest([{ path: 'id', message: `There is no quiz with the id ${req.params.id}` }]);
    }

    res.noContent();
}

export async function deleteQuizzes(req: Request<unknown, unknown, IdArray>, res: Response) {
    const deletedCount = await prisma.quiz.deleteMany({
        where: {
            id: {
                in: req.body.ids,
            },
        },
    });

    res.ok({ deletedCount });
}
