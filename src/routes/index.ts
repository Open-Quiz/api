import { Router } from 'express';
import { createQuiz, deleteQuiz, getAllQuizzes, getQuiz } from '../controllers/quizController';
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
import { CompleteCreateQuizModel } from '../models/zod/createQuizModel';
import { IdModel, IdArrayModel } from '../models/zod/idModel';
import { CreateQuizQuestionModel, PatchQuizQuestionModel } from '../zod';

export const quizQuestionRoutes = Router();
export const quizRoutes = Router();

const CreateQuizModelArray = CreateQuizQuestionModel.array();

quizRoutes
    .route('/')
    .get(getAllQuizzes)
    .post(validate({ body: CompleteCreateQuizModel }), createQuiz);

quizRoutes
    .route('/:id')
    .get(validate({ param: IdModel }), getQuiz)
    .delete(validate({ param: IdModel }), deleteQuiz);

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
