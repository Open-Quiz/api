import { Router } from 'express';
import { createQuiz, getAllQuizzes, getQuiz } from '../controllers/QuizController';
import validate from '../middleware/validate';
import IdModel from '../models/zod/PositiveIntegerModel';
import { CreateQuizModel } from '../zod';

export const quizRoutes = Router();

quizRoutes
    .route('/')
    .get(getAllQuizzes)
    .post(validate({ body: CreateQuizModel }), createQuiz);

quizRoutes.route('/:id').get(validate({ param: IdModel }), getQuiz);
