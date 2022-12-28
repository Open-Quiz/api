import { Router } from 'express';
import {
    createQuiz,
    createQuizzes,
    deleteQuiz,
    deleteQuizzes,
    getAllQuizzes,
    getQuiz,
    updateQuiz,
} from '../controllers/quizController';
import validate from '../middleware/validationHandler';
import { IdModel, IdArrayModel } from '../models/zod/idModel';
import { CreateQuizModel, PatchQuizModel } from '../zod';

export const quizRoutes = Router();

const CreateQuizModelArray = CreateQuizModel.array();

quizRoutes
    .route('/')
    .get(getAllQuizzes)
    .post(validate({ body: CreateQuizModel }), createQuiz);

quizRoutes
    .route('/:id')
    .get(validate({ param: IdModel }), getQuiz)
    .patch(validate({ param: IdModel, body: PatchQuizModel }), updateQuiz)
    .delete(validate({ param: IdModel }), deleteQuiz);

quizRoutes
    .route('/bulk')
    .post(validate({ body: CreateQuizModelArray }), createQuizzes)
    .delete(validate({ body: IdArrayModel }), deleteQuizzes);
