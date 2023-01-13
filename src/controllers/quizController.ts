import { Request, Response } from 'express';
import prisma from '../client/instance';
import { CompleteCreateQuiz } from '../models/zod/quizModel';
import { QuizQuestionService } from '../services/quizQuestionService';
import IdParam from '../types/idParam';
import { isNotUndefined } from '../utils/typing';
import { PatchQuiz } from '../zod';

export async function getAllQuizzes(req: Request, res: Response) {
    const allQuizzes = await prisma.quiz.findMany({
        include: { questions: true },
    });

    return res.ok(allQuizzes);
}

export async function getQuiz(req: Request<IdParam>, res: Response) {
    const quiz = await prisma.quiz.findFirst({
        where: {
            id: req.params.id,
        },
        include: { questions: true },
    });

    if (!quiz) {
        return res.notFound(`There is no quiz with the id ${req.params.id}`);
    }

    return res.ok(quiz);
}

export async function createQuiz(req: Request<unknown, unknown, CompleteCreateQuiz>, res: Response) {
    const { ownerId, title, isPublic, questions = [] } = req.body;

    const errors = questions
        .map(QuizQuestionService.isInvalid)
        .map((error, index) => (error ? { ...error, path: `questions.${index}.${error.path}` } : undefined))
        .filter(isNotUndefined);

    if (errors.length !== 0) {
        return res.badRequest(errors);
    }

    const newQuiz = await prisma.quiz.create({
        data: {
            ownerId,
            title,
            isPublic,
            questions: {
                createMany: {
                    data: questions,
                },
            },
        },
        include: { questions: true },
    });

    return res.created(newQuiz);
}

export async function updateQuiz(req: Request<IdParam, undefined, PatchQuiz>, res: Response) {
    try {
        const updatedQuiz = await prisma.quiz.update({
            where: { id: req.params.id },
            data: req.body,
            include: { questions: true },
        });

        res.ok(updatedQuiz);
    } catch (err) {
        return res.notFound(`There is no quiz with the id ${req.params.id}`);
    }
}

export async function deleteQuiz(req: Request<IdParam>, res: Response) {
    try {
        await prisma.quiz.delete({
            where: { id: req.params.id },
        });
    } catch (err) {
        return res.notFound(`There is no quiz with the id ${req.params.id}`);
    }

    res.noContent();
}
