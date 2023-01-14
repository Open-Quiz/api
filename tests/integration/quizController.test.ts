import prisma from '../../src/client/instance';
import request from 'supertest';
import { afterAll, describe, it, expect, beforeAll } from 'vitest';
import { app, server } from '../../src/testing/createTestApp';
import { mockQuiz, mockQuizQuestion } from '../../src/testing/mocks/mockQuiz';
import { CompleteCreateQuiz, CompleteQuiz } from '../../src/models/zod/quizModel';
import { ErrorResponse } from '../../src/types/expressAugmentation';
import { PatchQuiz } from '../../src/zod';
import { mockUser } from '../../src/testing/mocks/mockUser';
import { TokenService } from '../../src/services/tokenService';

describe('@integration - Quiz Controller', async () => {
    const quiz1: CompleteQuiz = {
        ...mockQuiz,
        id: 1,
        questions: [
            { ...mockQuizQuestion, id: 1, quizId: 1 },
            { ...mockQuizQuestion, id: 2, quizId: 1 },
        ],
    };
    const quiz2: CompleteQuiz = {
        ...mockQuiz,
        id: 2,
        questions: [
            { ...mockQuizQuestion, id: 3, quizId: 2 },
            { ...mockQuizQuestion, id: 4, quizId: 2 },
            { ...mockQuizQuestion, id: 5, quizId: 2 },
        ],
    };
    let quiz3: CompleteQuiz = {
        ...mockQuiz,
        id: 3,
        questions: [
            { ...mockQuizQuestion, id: 6, quizId: 3 },
            { ...mockQuizQuestion, id: 7, quizId: 3 },
            { ...mockQuizQuestion, id: 8, quizId: 3 },
        ],
    };

    const accessToken = `Bearer ${await TokenService.createAccessToken(1)}`;

    afterAll(async () => {
        const deleteQuestions = prisma.quizQuestion.deleteMany();
        const deleteQuizzes = prisma.quiz.deleteMany();
        const deleteUsers = prisma.quiz.deleteMany();

        await prisma.$transaction([deleteUsers, deleteQuizzes, deleteQuestions]);

        await prisma.$disconnect();
    });

    beforeAll(async () => {
        await prisma.user.create({
            data: mockUser,
        });

        await prisma.quiz.createMany({
            data: [mockQuiz, mockQuiz],
        });

        await prisma.quizQuestion.createMany({
            data: [
                { ...mockQuizQuestion, quizId: 1 },
                { ...mockQuizQuestion, quizId: 1 },
                { ...mockQuizQuestion, quizId: 2 },
                { ...mockQuizQuestion, quizId: 2 },
                { ...mockQuizQuestion, quizId: 2 },
            ],
        });
    });

    describe('GET /api/quizzes', async () => {
        it('returns all the quizzes in the database', async () => {
            const res = await request(app).get('/api/quizzes').set('authorization', accessToken);

            expect(res.statusCode).toBe(200);
            expect(res.body).toStrictEqual<CompleteQuiz[]>([quiz1, quiz2]);
        });
    });

    describe('GET /api/quizzes/:id', () => {
        it('returns the quiz with the specified id when it exists', async () => {
            const res = await request(app).get('/api/quizzes/1').set('authorization', accessToken);

            expect(res.statusCode).toBe(200);
            expect(res.body).toStrictEqual<CompleteQuiz>(quiz1);
        });

        it('returns a not found response when there is no quiz with the id', async () => {
            const res = await request(app).get('/api/quizzes/3').set('authorization', accessToken);

            expect(res.statusCode).toBe(404);
            expect(res.body).toStrictEqual<ErrorResponse>({
                error: 'There is no quiz with the id 3',
            });
        });
    });

    describe('POST /api/quizzes', async () => {
        it('should create 1 quiz and 3 quiz questions', async () => {
            const postQuiz: CompleteCreateQuiz = {
                ...mockQuiz,
                questions: [mockQuizQuestion, mockQuizQuestion, mockQuizQuestion],
            };
            const res = await request(app).post('/api/quizzes').send(postQuiz).set('authorization', accessToken);
            expect(res.statusCode).toBe(201);
            expect(res.body).toStrictEqual<CompleteQuiz>(quiz3);
        });
    });

    describe('PATCH /api/quizzes/:id', async () => {
        it('updates the quiz title and returns the updated quiz', async () => {
            const patchQuiz: PatchQuiz = {
                title: 'Updated Quiz Title',
            };

            const res = await request(app).patch('/api/quizzes/3').send(patchQuiz).set('authorization', accessToken);

            quiz3 = { ...quiz3, ...patchQuiz };

            expect(res.statusCode).toBe(200);
            expect(res.body).toStrictEqual<CompleteQuiz>(quiz3);
        });

        it('returns a not found response when there is no quiz with the id', async () => {
            const patchQuiz: PatchQuiz = {
                title: 'Updated Quiz Title',
            };

            const res = await request(app).patch('/api/quizzes/4').send(patchQuiz).set('authorization', accessToken);

            expect(res.statusCode).toBe(404);
            expect(res.body).toStrictEqual<ErrorResponse>({
                error: 'There is no quiz with the id 4',
            });
        });
    });

    describe('DELETE /api/quizzes/:id', () => {
        it('deletes the quiz when it exists', async () => {
            const res = await request(app).delete('/api/quizzes/3').set('authorization', accessToken);

            expect(res.statusCode).toBe(204);
            expect(res.body).toStrictEqual({});

            const quiz3 = await prisma.quiz.findFirst({
                where: { id: 3 },
            });

            expect(quiz3).toBeNull();
        });

        it('returns a not found response when there is no quiz with the id', async () => {
            const res = await request(app).delete('/api/quizzes/4').set('authorization', accessToken);

            expect(res.statusCode).toBe(404);
            expect(res.body).toStrictEqual<ErrorResponse>({
                error: 'There is no quiz with the id 4',
            });
        });
    });
});
