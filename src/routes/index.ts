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

export const quizRoutes = Router();

const CreateQuizModelArray = CreateQuizQuestionModel.array();

quizRoutes
    .route('/')
    .get(getAllQuizQuestions)
    .post(validate({ body: CreateQuizQuestionModel }), createQuizQuestion);

quizRoutes
    .route('/bulk')
    .post(validate({ body: CreateQuizModelArray }), createQuizQuestions)
    .delete(validate({ body: IdArrayModel }), deleteQuizQuestions);

quizRoutes
    .route('/:id')
    .get(validate({ param: IdModel }), getQuizQuestion)
    .patch(validate({ param: IdModel, body: PatchQuizQuestionModel }), updateQuizQuestion)
    .delete(validate({ param: IdModel }), deleteQuizQuestion);

quizRoutes.route('/:id/stats').patch(validate({ param: IdModel, body: AttemptModel }), updateQuizQuestionStats);
