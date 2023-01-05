import { QuizQuestion } from '@prisma/client';
import { CompleteQuiz } from '../../models/zod/quizModel';

export const mockQuizQuestion: Omit<QuizQuestion, 'id'> = {
    question: 'A test question',
    options: ['A', 'B', 'C'],
    correctOption: 1,
    totalCorrectAttempts: 3,
    totalIncorrectAttempts: 1,
    quizId: 1,
};

export function mockQuizzes(count: number): CompleteQuiz[] {
    let questionId = 0;
    return Array(count)
        .fill({})
        .map((_, index) =>
            mockQuiz(
                index,
                Array(3)
                    .fill({})
                    .map(() => ({ ...mockQuizQuestion, id: ++questionId })),
            ),
        );
}

export function mockQuiz(quizId: number, questions: Omit<QuizQuestion, 'quizId'>[]): CompleteQuiz {
    return {
        id: quizId,
        title: 'Test quiz',
        isPublic: false,
        questions: questions.map((question) => ({ ...question, quizId })),
    };
}
