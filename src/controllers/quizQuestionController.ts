import { Prisma, QuizQuestion } from '@prisma/client';
import { Request, Response } from 'express';
import prisma from '../client/instance';
import { Attempt } from '../models/zod/attemptModel';
import { IdArray } from '../models/zod/idModel';
import { QuizQuestionService } from '../services/QuizQuestionService';
import IdParam from '../types/idParam';
import { DEFAULT } from '../utils/postgres';
import { CreateQuizQuestion, PatchQuizQuestion } from '../zod';

export async function getAllQuizQuestions(req: Request, res: Response) {
    const allQuestions = await prisma.quizQuestion.findMany();

    res.ok(allQuestions);
}

export async function getQuizQuestion(req: Request<IdParam>, res: Response) {
    const question = await prisma.quizQuestion.findUnique({ where: { id: req.params.id } });

    if (!question) {
        return res.notFound(`There is no quiz question with the id ${req.params.id}`);
    }

    res.ok(question);
}

export async function createQuizQuestion(req: Request<unknown, unknown, CreateQuizQuestion>, res: Response) {
    const error = QuizQuestionService.isInValid(req.body);
    if (error) return res.badRequest([error]);

    const newQuestion = await prisma.quizQuestion.create({
        data: req.body,
    });

    res.created(newQuestion);
}

export async function createQuizQuestions(req: Request<unknown, unknown, CreateQuizQuestion[]>, res: Response) {
    const errors = req.body
        .filter((question) => question.correctOption >= question.options.length)
        .map((question, index) => ({
            path: `${index}.correctOption`,
            message: 'The correct option must be an index of options',
        }));

    if (errors.length !== 0) {
        return res.badRequest(errors);
    }

    const values = req.body.map(
        (quiz) => Prisma.sql`(${quiz.question}, ${quiz.options}, ${quiz.correctOption ?? DEFAULT})`,
    );

    const newQuestions = await prisma.$queryRaw<QuizQuestion[]>`INSERT INTO public."Quiz"
        (question, options, "correctOption")
    VALUES
        ${Prisma.join(values)} 
    RETURNING *`;

    res.created(newQuestions);
}

export async function updateQuizQuestion(req: Request<IdParam, unknown, PatchQuizQuestion>, res: Response) {
    try {
        const updatedQuestion = await prisma.quizQuestion.update({
            where: { id: req.params.id },
            data: req.body,
        });

        res.ok(updatedQuestion);
    } catch (err) {
        return res.badRequest([{ path: 'id', message: `There is no quiz question with the id ${req.params.id}` }]);
    }
}

export async function deleteQuizQuestion(req: Request<IdParam>, res: Response) {
    try {
        await prisma.quizQuestion.delete({
            where: { id: req.params.id },
        });
    } catch (err) {
        return res.badRequest([{ path: 'id', message: `There is no quiz question with the id ${req.params.id}` }]);
    }

    res.noContent();
}

export async function deleteQuizQuestions(req: Request<unknown, unknown, IdArray>, res: Response) {
    const deletedCount = await prisma.quizQuestion.deleteMany({
        where: {
            id: {
                in: req.body.ids,
            },
        },
    });

    res.ok({ deletedCount });
}

export async function updateQuizQuestionStats(req: Request<IdParam, unknown, Attempt>, res: Response) {
    await prisma.quizQuestion.update({
        where: { id: req.params.id },
        data: req.body.isCorrect
            ? {
                  totalCorrectAttempts: { increment: 1 },
              }
            : {
                  totalIncorrectAttempts: { increment: 1 },
              },
    });

    res.noContent();
}
