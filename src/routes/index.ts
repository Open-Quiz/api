import { Router } from 'express';
import { createQuiz, getAllQuizzes, getQuiz } from '../controllers/QuizController';

const apiRoutes = Router();

apiRoutes.route('/quizzes/').get(getAllQuizzes).post(createQuiz);
apiRoutes.route('/quizzes/:id').get(getQuiz);

export default apiRoutes;
