import express from 'express';
import ErrorHandler from '../middleware/errorHandler';
import { quizQuestionRoutes } from '../routes';

// Apply module augmentation
import '../types/response';

export default function createApp(port: number) {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    app.use('/api/quizzes/questions', quizQuestionRoutes);

    app.use(ErrorHandler);

    app.listen(port, () => {
        console.log(`⚡[server]: Server is running on port ${port}`);
    });

    return app;
}
