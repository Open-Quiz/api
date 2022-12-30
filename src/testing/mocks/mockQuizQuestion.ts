import { QuizQuestion } from '@prisma/client';

export const mockQuizQuestion: Omit<QuizQuestion, 'id'> = {
    question: 'A test question',
    options: ['A', 'B', 'C'],
    correctOption: 1,
    totalCorrectAttempts: 3,
    totalIncorrectAttempts: 1,
};
