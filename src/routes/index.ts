import { Router } from 'express';
import {
    createQuizQuestion,
    createQuizQuestions,
    deleteQuizQuestion,
    deleteQuizQuestions,
    getAllQuizQuestions,
    getQuizQuestion,
    updateQuizQuestion,
    updateQuizQuestionStats,
} from '../controllers/quizQuestionController';
import validate from '../middleware/validationHandler';
import { AttemptModel } from '../models/zod/attemptModel';
import { IdModel, IdArrayModel } from '../models/zod/idModel';
import { CreateQuizQuestionModel, PatchQuizQuestionModel } from '../zod';

export const quizQuestionRoutes = Router();

const CreateQuizModelArray = CreateQuizQuestionModel.array();

quizQuestionRoutes
    .route('/')
    .get(getAllQuizQuestions)
    .post(validate({ body: CreateQuizQuestionModel }), createQuizQuestion);

quizQuestionRoutes
    .route('/bulk')
    .post(validate({ body: CreateQuizModelArray }), createQuizQuestions)
    .delete(validate({ body: IdArrayModel }), deleteQuizQuestions);

quizQuestionRoutes
    .route('/:id')
    .get(validate({ param: IdModel }), getQuizQuestion)
    .patch(validate({ param: IdModel, body: PatchQuizQuestionModel }), updateQuizQuestion)
    .delete(validate({ param: IdModel }), deleteQuizQuestion);

quizQuestionRoutes.route('/:id/stats').patch(validate({ param: IdModel, body: AttemptModel }), updateQuizQuestionStats);
