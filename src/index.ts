import express from 'express';
import dotenv from 'dotenv';
import { quizQuestionRoutes } from './routes';

// Apply module augmentation
import './types/response';
import ErrorHandler from './middleware/errorHandler';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/quizzes/questions', quizQuestionRoutes);

app.use(ErrorHandler);

app.listen(port, () => {
    console.log(`⚡[server]: Server is running on port ${port}`);
});
