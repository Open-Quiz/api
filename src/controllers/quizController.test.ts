import request from 'supertest';
import { vi, describe, it, expect, afterAll } from 'vitest';
import { mockQuizzes } from '../testing/mocks/mockQuiz';
import mockPrisma from '../client/__mocks__/instance';
import { CompleteQuiz } from '../models/zod/quizModel';
import { app } from '../testing/createTestApp';

vi.mock('../client/instance');

describe('Quiz Controller', () => {
    describe('GET /api/quizzes', () => {
        it('returns all the quizzes', async () => {
            const quizzes = mockQuizzes(3);

            mockPrisma.quiz.findMany.mockResolvedValue(quizzes);

            const res = await request(app).get('/api/quizzes');

            expect(res.statusCode).toBe(200);
            expect(res.body).toStrictEqual<CompleteQuiz[]>(quizzes);
        });
    });
});
