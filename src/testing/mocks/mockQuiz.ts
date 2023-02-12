import { Quiz, QuizQuestion } from '@prisma/client';

export const mockQuiz: Omit<Quiz, 'id' | 'ownerId' | 'sharedWithUserIds'> = {
    title: 'Test Quiz',
    isPublic: false,
};

export const mockQuizQuestion: Omit<QuizQuestion, 'id' | 'quizId'> = {
    question: 'A test question',
    options: ['A', 'B', 'C'],
    correctOption: 1,
    totalCorrectAttempts: 3,
    totalIncorrectAttempts: 1,
};
