import prisma from '../client/instance';
import { describe, it, expect, beforeAll } from 'vitest';
import { mockQuiz, mockQuizQuestion } from '../testing/mocks/mockQuiz';
import { CompleteCreateQuiz } from '../models/zod/quizModel';
import { ErrorResponse } from '../types/expressAugmentation';
import { PatchQuiz } from '../zod';
import { mockUser } from '../testing/mocks/mockUser';
import { TokenService } from '../services/tokenService';
import request from '../testing/request';
import { User } from '@prisma/client';
import quizDto, { QuizDto } from '../models/dtos/quizDto';

describe('@Integration - Quiz Controller', async () => {
    let user1: User;
    let user2: User;
    let quiz1: QuizDto;
    let quiz2: QuizDto;

    let user1AccessToken: string;
    let user2AccessToken: string;

    beforeAll(async () => {
        user1 = await prisma.user.create({
            data: mockUser,
        });

        user2 = await prisma.user.create({
            data: mockUser,
        });

        user1AccessToken = `Bearer ${await TokenService.signAccessToken(user1.id)}`;
        user2AccessToken = `Bearer ${await TokenService.signAccessToken(user2.id)}`;

        quiz1 = quizDto(
            await prisma.quiz.create({
                data: {
                    ...mockQuiz,
                    ownerId: user1.id,
                    questions: {
                        createMany: {
                            data: [mockQuizQuestion, mockQuizQuestion],
                        },
                    },
                },
                include: { questions: true },
            }),
        );

        quiz2 = quizDto(
            await prisma.quiz.create({
                data: {
                    ...mockQuiz,
                    isPublic: true,
                    ownerId: user1.id,
                    questions: {
                        createMany: {
                            data: [mockQuizQuestion, mockQuizQuestion, mockQuizQuestion],
                        },
                    },
                },
                include: { questions: true },
            }),
        );
    });

    describe('GET /api/quizzes', async () => {
        it('returns the 2 quizzes which the user created', async () => {
            const res = await request.get('/api/quizzes').set('authorization', user1AccessToken);

            expect(res.statusCode).toBe(200);
            expect(res.body).toStrictEqual<QuizDto[]>([quiz1, quiz2]);
        });

        it('returns the public quiz created by the other user', async () => {
            const res = await request.get('/api/quizzes').set('authorization', user2AccessToken);

            expect(res.statusCode).toBe(200);
            expect(res.body).toStrictEqual<QuizDto[]>([quiz2]);
        });
    });

    describe('GET /api/quizzes/:id', () => {
        it('returns the quiz with the specified id when it exists', async () => {
            const res = await request.get('/api/quizzes/1').set('authorization', user1AccessToken);

            expect(res.statusCode).toBe(200);
            expect(res.body).toStrictEqual<QuizDto>(quiz1);
        });

        it('returns a not found response when there is no quiz with the id', async () => {
            const res = await request.get('/api/quizzes/3').set('authorization', user1AccessToken);

            expect(res.statusCode).toBe(404);
            expect(res.body).toStrictEqual<ErrorResponse>({
                error: 'There is no quiz with the id 3',
            });
        });

        it('returns a forbidden response if you dont have access to the quiz', async () => {
            const res = await request.get('/api/quizzes/1').set('authorization', user2AccessToken);

            expect(res.statusCode).toBe(403);
            expect(res.body).toStrictEqual<ErrorResponse>({
                error: 'You do not have access to the quiz 1',
            });
        });

        it('returns the quiz with the specified id if it is public', async () => {
            const res = await request.get('/api/quizzes/2').set('authorization', user2AccessToken);

            expect(res.statusCode).toBe(200);
            expect(res.body).toStrictEqual<QuizDto>(quiz2);
        });
    });

    describe('PATCH /api/quizzes/:id', async () => {
        it('updates the quiz title and returns the updated quiz', async () => {
            const patchQuiz: PatchQuiz = {
                title: 'Updated Quiz Title',
            };

            const res = await request.patch('/api/quizzes/2').send(patchQuiz).set('authorization', user1AccessToken);

            quiz2 = { ...quiz2, ...patchQuiz };

            expect(res.statusCode).toBe(200);
            expect(res.body).toStrictEqual<QuizDto>(quiz2);
        });

        it('returns a not found response when there is no quiz with the id', async () => {
            const patchQuiz: PatchQuiz = {
                title: 'Updated Quiz Title',
            };

            const res = await request.patch('/api/quizzes/3').send(patchQuiz).set('authorization', user1AccessToken);

            expect(res.statusCode).toBe(404);
            expect(res.body).toStrictEqual<ErrorResponse>({
                error: 'There is no quiz with the id 3',
            });
        });

        it('returns a forbidden response if you are not the owner of the quiz', async () => {
            const patchQuiz: PatchQuiz = {
                title: 'Updated Quiz Title',
            };

            const res = await request.patch('/api/quizzes/1').send(patchQuiz).set('authorization', user2AccessToken);

            expect(res.statusCode).toBe(403);
            expect(res.body).toStrictEqual<ErrorResponse>({
                error: 'Only the owner can update a quiz',
            });
        });
    });

    describe('POST /api/quizzes', async () => {
        it('should create 1 quiz and 3 quiz questions', async () => {
            const postQuiz: CompleteCreateQuiz = {
                ...mockQuiz,
                questions: [mockQuizQuestion, mockQuizQuestion, mockQuizQuestion],
            };
            const res = await request.post('/api/quizzes').send(postQuiz).set('authorization', user1AccessToken);

            expect(res.statusCode).toBe(201);
            expect(res.body).toStrictEqual<QuizDto>({
                ...mockQuiz,
                id: 3,
                ownerId: user1.id,
                sharedWithUserIds: [],
                questions: [
                    {
                        ...mockQuizQuestion,
                        id: 6,
                    },
                    {
                        ...mockQuizQuestion,
                        id: 7,
                    },
                    {
                        ...mockQuizQuestion,
                        id: 8,
                    },
                ],
            });
        });
    });

    describe('DELETE /api/quizzes/:id', () => {
        it('deletes the quiz when it exists', async () => {
            const res = await request.delete('/api/quizzes/3').set('authorization', user1AccessToken);

            expect(res.statusCode).toBe(204);
            expect(res.body).toStrictEqual({});

            const quiz3 = await prisma.quiz.findFirst({
                where: { id: 3 },
            });

            expect(quiz3).toBeNull();
        });

        it('returns a not found response when there is no quiz with the id', async () => {
            const res = await request.delete('/api/quizzes/3').set('authorization', user1AccessToken);

            expect(res.statusCode).toBe(404);
            expect(res.body).toStrictEqual<ErrorResponse>({
                error: 'There is no quiz with the id 3',
            });
        });

        it('returns a forbidden response if you are not the owner of the quiz', async () => {
            const res = await request.delete('/api/quizzes/1').set('authorization', user2AccessToken);

            expect(res.statusCode).toBe(403);
            expect(res.body).toStrictEqual<ErrorResponse>({
                error: 'Only the owner can delete a quiz',
            });
        });
    });
});
