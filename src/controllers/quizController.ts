import { NextFunction, Request, Response } from 'express';
import prisma from '../client/instance';
import quizDto, { QuizDto } from '../models/dtos/quizDto';
import { CompleteCreateQuiz } from '../models/zod/quizModel';
import quizService from '../services/quizService';
import IdParam from '../types/interfaces/idParam';
import { PatchQuiz } from '../zod';

export async function getAllQuizzes(req: Request, res: Response<QuizDto[]>) {
    const allQuizzes = await quizService.getAllAccessibleQuizzes(req.requester.id);
    res.ok(allQuizzes);
}

export async function getQuiz(req: Request<IdParam>, res: Response<QuizDto>, next: NextFunction) {
    try {
        const quiz = await quizService.getAccessibleQuiz(req.params.id, req.requester.id);
        res.ok(quiz);
    } catch (err) {
        next(err);
    }
}

export async function createQuiz(
    req: Request<unknown, unknown, CompleteCreateQuiz>,
    res: Response,
    next: NextFunction,
) {
    try {
        const newQuiz = await quizService.createQuiz(req.body, req.requester.id);
        res.ok(newQuiz);
    } catch (err) {
        next(err);
    }
}

export async function updateQuiz(req: Request<IdParam, undefined, PatchQuiz>, res: Response, next: NextFunction) {
    const quizPatch = req.body;
    const quiz = await prisma.quiz.findFirst({
        where: { id: req.params.id },
    });

    if (!quiz) {
        return res.notFound(`There is no quiz with the id ${req.params.id}`);
    }

    if (quiz.ownerId !== req.requester.id) {
        return res.forbidden('Only the owner can update a quiz');
    }

    try {
        if (quizPatch.sharedWithUserIds) {
            quizPatch.sharedWithUserIds = await quizService.validateSharedWithUserIds(
                quizPatch.sharedWithUserIds,
                req.requester.id,
            );
        }

        const updatedQuiz = await prisma.quiz.update({
            where: { id: req.params.id },
            data: quizPatch,
            include: { questions: true },
        });

        const updatedQuizDto = quizDto(updatedQuiz);
        res.ok(updatedQuizDto);
    } catch (err) {
        next(err);
    }
}

export async function deleteQuiz(req: Request<IdParam>, res: Response) {
    const quiz = await prisma.quiz.findFirst({
        where: { id: req.params.id },
    });

    if (!quiz) {
        return res.notFound(`There is no quiz with the id ${req.params.id}`);
    }

    if (quiz.ownerId !== req.requester.id) {
        return res.forbidden('Only the owner can delete a quiz');
    }

    await prisma.quiz.delete({
        where: { id: req.params.id },
    });

    res.noContent();
}
