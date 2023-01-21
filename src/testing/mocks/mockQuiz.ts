import { Quiz, QuizQuestion } from '@prisma/client';
import { CompleteQuiz } from '../../models/zod/quizModel';

export const mockQuiz: Omit<Quiz, 'id' | 'ownerId'> = {
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

export function mockQuizQuestions(count: number): Omit<QuizQuestion, 'id' | 'quizId'>[] {
    return Array(count).fill(mockQuizQuestion);
}

export function mockQuizzes(count: number, questionsPerQuiz = 3): CompleteQuiz[] {
    // let questionId = 0;

    // return Array(count)
    //     .fill({})
    //     .map((_, index) => ({
    //         ...mockQuiz,
    //         id: index,
    //         questions: Array(questionsPerQuiz)
    //             .fill({})
    //             .map(() => ({ ...mockQuizQuestion, id: ++questionId, quizId: index })),
    //     }));
    return [];
}
