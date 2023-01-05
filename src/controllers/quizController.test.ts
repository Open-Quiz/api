import request from 'supertest';
import { vi, describe, it, expect, afterAll } from 'vitest';
import mockPrisma from '../client/__mocks__/instance';
import { CompleteCreateQuiz, CompleteQuiz } from '../models/zod/quizModel';
import { app, server } from '../testing/createTestApp';
import { mockQuiz, mockQuizQuestion, mockQuizQuestions, mockQuizzes } from '../testing/mocks/mockQuiz';
import { BadRequestResponse } from '../types/response';

vi.mock('../client/instance');

describe('Quiz Controller', () => {
    afterAll(() => {
        server.close();
    });

    describe('GET /api/quizzes', () => {
        it('returns all the quizzes', async () => {
            const quizzes = mockQuizzes(3);

            mockPrisma.quiz.findMany.mockResolvedValue(quizzes);

            const res = await request(app).get('/api/quizzes');

            expect(res.statusCode).toBe(200);
            expect(res.body).toStrictEqual<CompleteQuiz[]>(quizzes);
        });
    });

    describe('POST /api/quizzes', () => {
        it('returns the newly created quiz with the quizId set for all of them', async () => {
            const questions = 3;
            const postQuiz: CompleteCreateQuiz = {
                ...mockQuiz,
                questions: mockQuizQuestions(questions),
            };

            const createdQuiz = mockQuizzes(1, questions)[0];

            mockPrisma.quiz.create.mockResolvedValue(createdQuiz);

            const res = await request(app).post('/api/quizzes').send(postQuiz);

            expect(res.statusCode).toBe(201);
            expect(res.body).toStrictEqual(createdQuiz);
        });

        it('validates that each quiz question is valid', async () => {
            const postQuiz = {
                ...mockQuiz,
                questions: [
                    // Questions at index 0 and 2 are invalid
                    { ...mockQuizQuestion, options: 'Incorrect value' },
                    { ...mockQuizQuestion },
                    { ...mockQuizQuestion, question: undefined, correctOption: 'A' },
                ],
            };

            const res = await request(app).post('/api/quizzes').send(postQuiz);

            expect(res.statusCode).toBe(400);
            expect(res.body).toStrictEqual<BadRequestResponse>({
                errors: [
                    { path: 'questions.0.options', message: 'Expected array, received string' },
                    { path: 'questions.2.question', message: 'Required' },
                    { path: 'questions.2.correctOption', message: 'Expected number, received string' },
                ],
            });
        });

        it('validates that each correct option is valid', async () => {
            const postQuiz: CompleteCreateQuiz = {
                ...mockQuiz,
                questions: [
                    // Questions at index 0 and 4 are invalid
                    { ...mockQuizQuestion, correctOption: 99 },
                    ...mockQuizQuestions(3),
                    { ...mockQuizQuestion, correctOption: 99 },
                ],
            };

            const res = await request(app).post('/api/quizzes').send(postQuiz);

            expect(res.statusCode).toBe(400);
            expect(res.body).toStrictEqual<BadRequestResponse>({
                errors: [
                    { path: 'questions.0.correctOption', message: 'The correct option must be an index of options' },
                    { path: 'questions.4.correctOption', message: 'The correct option must be an index of options' },
                ],
            });
        });
    });
});
