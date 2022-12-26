import { Router } from 'express';
import { getAllQuizzes, getQuiz } from '../controllers/QuizController';

const apiRoutes = Router();

apiRoutes.route('/quizzes/').get(getAllQuizzes);
apiRoutes.route('/quizzes/:id').get(getQuiz);

export default apiRoutes;
