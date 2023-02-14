import { NextFunction, Request, Response } from 'express';
import prisma from '../client/instance';
import quizDto, { QuizDto } from '../models/dtos/quizDto';
import { CompleteCreateQuiz } from '../models/zod/quizModel';
import quizService from '../services/quizService';
import IdParam from '../types/interfaces/idParam';
import { PatchQuiz } from '../zod';

export async function getAllQuizzes(req: Request, res: Response<QuizDto[]>) {
    const allQuizzes = await quizService.getAllViewableQuizzes(req.requester.id);
    res.ok(allQuizzes.map(quizDto));
}

export async function getQuizById(req: Request<IdParam>, res: Response, next: NextFunction) {
    try {
        const quiz = await quizService.getViewableQuizById(req.params.id, req.requester.id);
        res.ok(quizDto(quiz));
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
        res.created(quizDto(newQuiz));
    } catch (err) {
        next(err);
    }
}

export async function updateQuizById(req: Request<IdParam, undefined, PatchQuiz>, res: Response, next: NextFunction) {
    try {
        const quiz = await quizService.getQuizById(req.params.id);

        if (quiz.ownerId !== req.requester.id) {
            return res.forbidden('Only the owner can update a quiz');
        }

        const updatedQuiz = await quizService.updateQuizById(req.params.id, req.requester.id, req.body);

        res.ok(quizDto(updatedQuiz));
    } catch (err) {
        next(err);
    }
}

export async function deleteQuizById(req: Request<IdParam>, res: Response, next: NextFunction) {
    try {
        const quiz = await quizService.getQuizById(req.params.id);

        if (quiz.ownerId !== req.requester.id) {
            return res.forbidden('Only the owner can delete a quiz');
        }

        await quizService.deleteQuizById(req.params.id);

        res.noContent();
    } catch (err) {
        next(err);
    }
}
