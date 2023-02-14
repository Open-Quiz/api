import express from 'express';
import config from '../config';
import QuizController from '../controllers/quizController';
import authenticationHandler from '../middleware/authenticationHandler';
import ErrorHandler from '../middleware/errorHandler';
import { quizQuestionRoutes } from '../routes';
import { useRoutes } from '../routes/meta/addRoutes';
import quizService from '../services/quizService';

// Apply module augmentation
import '../types/augmentation/expressAugmentation';

export default function createApp() {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(authenticationHandler);

    app.use('/api/quizzes/questions', quizQuestionRoutes);
    useRoutes(app, new QuizController(quizService));

    app.use(ErrorHandler);

    const server = app.listen(config.api.port, () => {
        console.log(`⚡[server]: Server is running on port ${config.api.port}`);
    });

    return { app, server };
}
