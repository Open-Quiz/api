import { Quiz, QuizQuestion } from '@prisma/client';
import { z } from 'zod';
import { QuizModel } from './generated';
import { CreateQuestionModel } from './questionModel';

const optionalKeys = {
    isPublic: true,
    sharedWithUserIds: true,
} as const;

export const CreateQuizModel = QuizModel.omit({ ...optionalKeys, id: true, ownerId: true })
    .extend({
        questions: CreateQuestionModel.array(),
    })
    .merge(QuizModel.pick(optionalKeys).partial());

export const UpdateQuizModel = CreateQuizModel.omit({ questions: true }).partial();

export type CompleteQuiz = Quiz & { questions: QuizQuestion[] };
export type CreateQuiz = z.infer<typeof CreateQuizModel>;
export type UpdateQuiz = z.infer<typeof UpdateQuizModel>;
