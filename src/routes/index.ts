import { Router } from 'express';
import { createQuiz, getAllQuizzes, getQuiz } from '../controllers/QuizController';
import validate from '../middleware/validate';
import { CreateQuizModel } from '../zod';

const apiRoutes = Router();

apiRoutes
    .route('/quizzes/')
    .get(getAllQuizzes)
    .post(validate({ body: CreateQuizModel }), createQuiz);
apiRoutes.route('/quizzes/:id').get(getQuiz);

export default apiRoutes;
