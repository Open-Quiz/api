import request from 'supertest';
import createApp from '../app/createApp';
import mockPrisma from '../testing/mockPrismaClient';
import { expect, it, describe, beforeAll, vi } from 'vitest';
import { Express } from 'express';
import { QuizQuestion } from '@prisma/client';

vi.mock('../client/instance');

describe('GET /api/quizzes/questions', () => {
    let app: Express;

    beforeAll(() => {
        app = createApp(8001);
    });

    it('returns all quiz questions', async () => {
        const quizQuestions: QuizQuestion[] = [
            {
                id: 1,
                question: 'Test Question 1',
                options: ['A', 'B', 'C'],
                correctOption: 0,
                totalCorrectAttempts: 1,
                totalIncorrectAttempts: 2,
            },
            {
                id: 2,
                question: 'Test Question 2',
                options: ['True', 'False'],
                correctOption: 1,
                totalCorrectAttempts: 3,
                totalIncorrectAttempts: 0,
            },
        ];

        console.log(mockPrisma);
        mockPrisma.quizQuestion.findMany.mockResolvedValue(quizQuestions);

        const res = await request(app).get('/api/quizzes/questions');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual<QuizQuestion[]>(quizQuestions);
    });
});
