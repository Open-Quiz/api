import request from 'supertest';
import createApp from '../app/createApp';
import mockPrisma from '../testing/mocks/mockPrismaClient';
import { expect, it, describe, beforeAll, vi } from 'vitest';
import { Express } from 'express';
import { QuizQuestion } from '@prisma/client';
import { mockQuizQuestion } from '../testing/mocks/mockQuizQuestion';
import { BadRequestResponse, ErrorResponse } from '../types/response';

vi.mock('../client/instance');

let app: Express;

beforeAll(() => {
    app = createApp(8001);
});

describe('GET /api/quizzes/questions', () => {
    it('returns all quiz questions', async () => {
        const quizQuestions: QuizQuestion[] = Array(4)
            .fill({})
            .map((_, index) => ({ ...mockQuizQuestion, id: index + 1 }));

        mockPrisma.quizQuestion.findMany.mockResolvedValue(quizQuestions);

        const res = await request(app).get('/api/quizzes/questions');

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual<QuizQuestion[]>(quizQuestions);
    });

    it('returns an empty array if there are no quiz questions', async () => {
        mockPrisma.quizQuestion.findMany.mockResolvedValue([]);

        const res = await request(app).get('/api/quizzes/questions');

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual<QuizQuestion[]>([]);
    });
});

describe('GET /api/quizzes/question/:id', () => {
    it('returns the quiz question with the id if it exists', async () => {
        const quizQuestion: QuizQuestion = { id: 1, ...mockQuizQuestion };

        mockPrisma.quizQuestion.findUnique.mockResolvedValue(quizQuestion);

        const res = await request(app).get(`/api/quizzes/questions/${quizQuestion.id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual<QuizQuestion>(quizQuestion);
    });

    it('returns not found if there is no quiz question with the id', async () => {
        mockPrisma.quizQuestion.findUnique.mockResolvedValue(null);

        const res = await request(app).get(`/api/quizzes/questions/1`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toStrictEqual<ErrorResponse>({ error: 'There is no quiz question with the id 1' });
    });

    it('returns bad request if the id is not a number', async () => {
        const res = await request(app).get(`/api/quizzes/questions/abc`);

        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual<BadRequestResponse>({
            errors: [{ path: 'id', message: 'Expected number, received nan' }],
        });
    });
});
