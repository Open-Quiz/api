import express from 'express';
import authenticationHandler from '../middleware/authenticationHandler';
import ErrorHandler from '../middleware/errorHandler';
import { quizQuestionRoutes, quizRoutes } from '../routes';

// Apply module augmentation
import '../types/augmentation/expressAugmentation';

export default function createApp() {
    const port = Number(process.env.PORT) || 8000;
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(authenticationHandler);

    app.use('/api/quizzes/questions', quizQuestionRoutes);
    app.use('/api/quizzes', quizRoutes);

    app.use(ErrorHandler);

    const server = app.listen(port, () => {
        console.log(`⚡[server]: Server is running on port ${port}`);
    });

    return { app, server };
}
