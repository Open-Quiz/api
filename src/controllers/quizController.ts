import { Request, Response } from 'express';
import prisma from '../client/instance';
import quizDto from '../models/dtos/quizDto';
import { CompleteCreateQuiz } from '../models/zod/quizModel';
import { QuizQuestionService } from '../services/quizQuestionService';
import { QuizService } from '../services/quizService';
import IdParam from '../types/idParam';
import { isNotUndefined } from '../utils/typing';
import { PatchQuiz } from '../zod';

export async function getAllQuizzes(req: Request, res: Response) {
    const allQuizzes = await prisma.quiz.findMany({
        include: { questions: true },
        where: QuizService.whereUserCanAccess(req.requester.id),
    });

    const quizDtos = allQuizzes.map(quizDto);
    return res.ok(quizDtos);
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

    if (!QuizService.canUserAccess(quiz, req.requester.id)) {
        return res.forbidden(`You do not have access to the quiz ${quiz.id}`);
    }

    return res.ok(quizDto(quiz));
}

export async function createQuiz(req: Request<unknown, unknown, CompleteCreateQuiz>, res: Response) {
    const { title, isPublic, questions = [] } = req.body;

    const errors = questions
        .map(QuizQuestionService.isInvalid)
        .map((error, index) => (error ? { ...error, path: `questions.${index}.${error.path}` } : undefined))
        .filter(isNotUndefined);

    if (errors.length !== 0) {
        return res.badRequest(errors);
    }

    const newQuiz = await prisma.quiz.create({
        data: {
            ownerId: req.requester.id,
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

    const newQuizDto = quizDto(newQuiz);
    return res.created(newQuizDto);
}

export async function updateQuiz(req: Request<IdParam, undefined, PatchQuiz>, res: Response) {
    const quiz = await prisma.quiz.findFirst({
        where: { id: req.params.id },
    });

    if (!quiz) {
        return res.notFound(`There is no quiz with the id ${req.params.id}`);
    }

    if (quiz.ownerId !== req.requester.id) {
        return res.forbidden('Only the owner can update a quiz');
    }

    const updatedQuiz = await prisma.quiz.update({
        where: { id: req.params.id },
        data: req.body,
        include: { questions: true },
    });

    const updatedQuizDto = quizDto(updatedQuiz);
    res.ok(updatedQuizDto);
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
