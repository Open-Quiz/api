import { z } from 'zod';
import { QuizQuestionModel } from './generated';

const optionalKeys = {
    totalCorrectAttempts: true,
    totalIncorrectAttempts: true,
} as const;

export const CreateQuestionModel = QuizQuestionModel.omit({ ...optionalKeys, id: true, quizId: true }).merge(
    QuizQuestionModel.pick(optionalKeys).partial(),
);

export const UpdateQuestionModel = CreateQuestionModel.omit({
    totalCorrectAttempts: true,
    totalIncorrectAttempts: true,
}).partial();

export const AppendQuestionsModel = z.object({
    questions: CreateQuestionModel.array(),
});

export const QuestionIdsModel = z.object({
    questionIds: z.number().array(),
});

export const UpdateQuestionStatsModel = z.object({
    incrementCorrectAttempts: z.number().positive().optional(),
    incrementIncorrectAttempts: z.number().positive().optional(),
});

export type CreateQuestion = z.infer<typeof CreateQuestionModel>;
export type UpdateQuestion = z.infer<typeof UpdateQuestionModel>;
export type AppendQuestions = z.infer<typeof AppendQuestionsModel>;
export type QuestionIds = z.infer<typeof QuestionIdsModel>;
export type UpdateQuestionStats = z.infer<typeof UpdateQuestionStatsModel>;
