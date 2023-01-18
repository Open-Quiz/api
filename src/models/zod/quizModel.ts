import { Quiz, QuizQuestion } from '@prisma/client';
import { z } from 'zod';
import { CreateQuizModel, CreateQuizQuestionModel } from '../../zod';

export const CompleteCreateQuizModel = CreateQuizModel.omit({ ownerId: true }).extend({
    questions: CreateQuizQuestionModel.omit({ quizId: true }).array().optional(),
});

export type CompleteCreateQuiz = z.infer<typeof CompleteCreateQuizModel>;

export type CompleteQuiz = Quiz & {
    questions: QuizQuestion[];
};
