import express from 'express';
import config from '../config';
import QuizController from '../controllers/quizController';
import QuizQuestionController from '../controllers/quizQuestionController';
import authenticationHandler from '../middleware/authenticationHandler';
import errorHandler from '../middleware/errorHandler';
import { useRoutes } from '../routes/meta/useRoutes';
import questionService from '../services/questionService';
import quizService from '../services/quizService';

// Apply module augmentation
import '../types/augmentation/expressAugmentation';

export default function createApp() {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(authenticationHandler);

    useRoutes(app, new QuizQuestionController(questionService));
    useRoutes(app, new QuizController(quizService));

    app.use(errorHandler);

    const server = app.listen(config.api.port, () => {
        console.log(`⚡[server]: Server is running on port ${config.api.port}`);
    });

    return { app, server };
}
