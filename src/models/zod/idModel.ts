import * as z from 'zod';

export const QuizIdModel = z.object({
    quizId: z.coerce.number().int().min(1),
});

export const QuestionIdModel = z.object({
    questionId: z.coerce.number().int().min(1),
});

export type QuizId = z.infer<typeof QuizIdModel>;
export type QuestionId = z.infer<typeof QuestionIdModel>;
