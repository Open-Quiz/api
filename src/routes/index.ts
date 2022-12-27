import { Router } from 'express';
import { createQuiz, getAllQuizzes, getQuiz } from '../controllers/quizController';
import validate from '../middleware/validationHandler';
import IdModel from '../models/zod/idModel';
import { CreateQuizModel } from '../zod';

export const quizRoutes = Router();

quizRoutes
    .route('/')
    .get(getAllQuizzes)
    .post(validate({ body: CreateQuizModel }), createQuiz);

quizRoutes.route('/:id').get(validate({ param: IdModel }), getQuiz);
