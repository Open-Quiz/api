import { z } from 'zod';
import { QuizQuestionModel } from './generated';

const optionalKeys = {
    totalCorrectAttempts: true,
    totalIncorrectAttempts: true,
} as const;

export const CreateQuestionModel = QuizQuestionModel.omit({ ...optionalKeys, id: true, quizId: true }).merge(
    QuizQuestionModel.pick(optionalKeys).partial(),
);

export const AppendQuizQuestionsModel = z.object({
    questions: CreateQuestionModel.array(),
});

export const UpdateQuestionModel = CreateQuestionModel.partial();

export type CreateQuestion = z.infer<typeof CreateQuestionModel>;
export type AppendQuizQuestions = z.infer<typeof AppendQuizQuestionsModel>;
export type UpdateQuestion = z.infer<typeof UpdateQuestionModel>;
