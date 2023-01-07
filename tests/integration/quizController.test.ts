import prisma from '../../src/client/instance';
import { afterAll, describe, it, expect, beforeAll } from 'vitest';
import { app, server } from '../../src/testing/createTestApp';
import { mockQuiz, mockQuizQuestion, mockQuizQuestions, mockQuizzes } from '../../src/testing/mocks/mockQuiz';
import { CompleteCreateQuiz, CompleteQuiz } from '../../src/models/zod/quizModel';
import request from 'supertest';

describe('@integration - Quiz Controller', () => {
    afterAll(async () => {
        server.close();

        const deleteQuestions = prisma.quizQuestion.deleteMany();
        const deleteQuizzes = prisma.quiz.deleteMany();

        await prisma.$transaction([deleteQuizzes, deleteQuestions]);

        await prisma.$disconnect();
    });

    describe('@integration - POST /api/quizzes', async () => {
        it('should create 1 quiz and 3 quiz questions', async () => {
            const postQuiz: CompleteCreateQuiz = {
                ...mockQuiz,
                questions: [mockQuizQuestion, mockQuizQuestion, mockQuizQuestion],
            };

            const res = await request(app).post('/api/quizzes').send(postQuiz);

            expect(res.statusCode).toBe(201);
            expect(res.body).toStrictEqual<CompleteQuiz>({
                ...mockQuiz,
                id: 1,
                questions: [
                    { ...mockQuizQuestion, id: 1, quizId: 1 },
                    { ...mockQuizQuestion, id: 2, quizId: 1 },
                    { ...mockQuizQuestion, id: 3, quizId: 1 },
                ],
            });
        });
    });
});
