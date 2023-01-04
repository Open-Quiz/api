import { z } from 'zod';
import { CreateQuizModel, CreateQuizQuestionModel } from '../../zod';

export const CompleteCreateQuizModel = CreateQuizModel.extend({
    quizzes: CreateQuizQuestionModel.omit({ quizId: true }).array().optional(),
});

export type CompleteCreateQuiz = z.infer<typeof CompleteCreateQuizModel>;
