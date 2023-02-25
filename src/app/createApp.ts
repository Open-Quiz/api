// Apply module augmentation
import '../types/augmentation/expressAugmentation';
import 'reflect-metadata';

import express from 'express';
import config from '../config';
import QuizController from '../controllers/quizController';
import QuizQuestionController from '../controllers/questionController';
import errorHandler from '../middleware/errorHandler';
import { useRoutes } from '../routes/useRoutes';

export default function createApp() {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    useRoutes(app, {
        baseRoute: '/api/v1',
        controllers: [new QuizQuestionController(), new QuizController()],
    });

    app.use(errorHandler);

    const server = app.listen(config.api.port, () => {
        console.log(`⚡[server]: Server is running on port ${config.api.port}`);
    });

    return { app, server };
}
