import request from 'supertest';
import mockPrisma from '../testing/mocks/mockPrismaClient';
import { expect, it, describe, vi, afterAll } from 'vitest';
import { QuizQuestion } from '@prisma/client';
import { mockQuizQuestion } from '../testing/mocks/mockQuiz';
import { BadRequestResponse, ErrorResponse } from '../types/response';
import { CreateQuizQuestion } from '../zod';
import { app, server } from '../testing/createTestApp';

vi.mock('../client/instance');

describe('Quiz Question Controller', () => {
    afterAll(() => {
        server.close();
    });

    describe('GET /api/quizzes/questions', () => {
        it('returns all quiz questions', async () => {
            const quizQuestions: QuizQuestion[] = Array(4)
                .fill({})
                .map((_, index) => ({ ...mockQuizQuestion, id: index + 1, quizId: 1 }));

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

    describe('GET /api/quizzes/questions/:id', () => {
        it('returns the quiz question with the id if it exists', async () => {
            const quizQuestion: QuizQuestion = { ...mockQuizQuestion, id: 1, quizId: 1 };

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
            const res = await request(app).get('/api/quizzes/questions/abc');

            expect(res.statusCode).toBe(400);
            expect(res.body).toStrictEqual<BadRequestResponse>({
                errors: [{ path: 'id', message: 'Expected number, received nan' }],
            });
        });

        it('returns bad request if the id is less than 1', async () => {
            const res = await request(app).get('/api/quizzes/questions/0');

            expect(res.statusCode).toBe(400);
            expect(res.body).toStrictEqual<BadRequestResponse>({
                errors: [{ path: 'id', message: 'Number must be greater than or equal to 1' }],
            });
        });
    });

    describe('POST /api/quizzes/questions', () => {
        const questionAndOptions = {
            question: 'Test Quiz Question',
            options: ['A', 'B', 'C'],
            quizId: 1,
        };

        it('returns the newly created quiz question', async () => {
            const partialQuizQuestion: CreateQuizQuestion = {
                correctOption: 1,
                ...questionAndOptions,
            };
            const fullQuizQuestion: QuizQuestion = {
                id: 1,
                totalCorrectAttempts: 0,
                totalIncorrectAttempts: 0,
                ...partialQuizQuestion,
            };

            mockPrisma.quizQuestion.create.mockResolvedValue(fullQuizQuestion);

            const res = await request(app).post('/api/quizzes/questions').send(partialQuizQuestion);

            expect(res.statusCode).toBe(201);
            expect(res.body).toStrictEqual<QuizQuestion>(fullQuizQuestion);
        });

        it('returns bad request if the correct option is not positive', async () => {
            const partialQuizQuestion: CreateQuizQuestion = {
                correctOption: -1,
                ...questionAndOptions,
            };

            const res = await request(app).post('/api/quizzes/questions').send(partialQuizQuestion);

            expect(res.statusCode).toBe(400);
            expect(res.body).toStrictEqual<BadRequestResponse>({
                errors: [{ path: 'correctOption', message: 'Number must be greater than 0' }],
            });
        });

        it('returns bad request if the correct option is not within the bounds of the options array', async () => {
            const partialQuizQuestion: CreateQuizQuestion = {
                correctOption: 3,
                ...questionAndOptions,
            };

            const res = await request(app).post('/api/quizzes/questions').send(partialQuizQuestion);

            expect(res.statusCode).toBe(400);
            expect(res.body).toStrictEqual<BadRequestResponse>({
                errors: [{ path: 'correctOption', message: 'The correct option must be an index of options' }],
            });
        });

        it('returns bad request if the body contains multiple errors', async () => {
            const invalidQuizQuestion = {
                correctOption: 'A',
                options: 'Test',
            };

            const res = await request(app).post('/api/quizzes/questions').send(invalidQuizQuestion);

            expect(res.statusCode).toBe(400);
            expect(res.body).toStrictEqual<BadRequestResponse>({
                errors: [
                    { path: 'question', message: 'Required' },
                    { path: 'options', message: 'Expected array, received string' },
                    { path: 'correctOption', message: 'Expected number, received string' },
                    { path: 'quizId', message: 'Required' },
                ],
            });
        });
    });
});
