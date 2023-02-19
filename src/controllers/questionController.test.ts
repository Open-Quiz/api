import { QuizQuestion, User } from '@prisma/client';
import { beforeAll, describe, expect, it } from 'vitest';
import prisma from '../client/instance';
import quizDto, { QuizDto } from '../models/dtos/quizDto';
import { QuestionIds, UpdateQuestion } from '../models/zod/questionModel';
import tokenService from '../services/tokenService';
import { mockQuiz, mockQuizQuestion } from '../testing/mocks/mockQuiz';
import { mockUser } from '../testing/mocks/mockUser';
import request from '../testing/request';
import setupTestApp from '../testing/setupTestApp';
import { BadRequestResponse, ErrorResponse } from '../types/augmentation/expressAugmentation';

setupTestApp();

describe('@Integration - Question Controller', async () => {
    let user1: User;
    let user2: User;

    let user1AccessToken: string;
    let user2AccessToken: string;

    let quiz: QuizDto;

    beforeAll(async () => {
        user1 = await prisma.user.create({ data: mockUser });
        user2 = await prisma.user.create({ data: mockUser });

        user1AccessToken = `Bearer ${await tokenService.signAccessToken(user1.id)}`;
        user2AccessToken = `Bearer ${await tokenService.signAccessToken(user2.id)}`;

        quiz = quizDto(
            await prisma.quiz.create({
                data: {
                    ...mockQuiz,
                    ownerId: 1,
                    sharedWithUserIds: [3],
                    questions: {
                        createMany: {
                            data: [mockQuizQuestion, mockQuizQuestion, mockQuizQuestion, mockQuizQuestion],
                        },
                    },
                },
                include: { questions: true },
            }),
        );
    });

    describe('GET /api/questions/:id', async () => {
        it('returns the question with the specified id if it exists', async () => {
            const res = await request.get('/api/questions/1').set('authorization', user1AccessToken);

            expect(res.statusCode).toBe(200);
            expect(res.body).toStrictEqual<QuizQuestion>({
                id: 1,
                quizId: 1,
                ...mockQuizQuestion,
            });
        });

        it('returns a not found response when there is no question with the id', async () => {
            const res = await request.get('/api/questions/5').set('authorization', user1AccessToken);

            expect(res.statusCode).toBe(404);
            expect(res.body).toStrictEqual<ErrorResponse>({
                error: 'There is no quiz question with the id 5',
            });
        });

        it('returns a forbidden response if you cant access the quiz question', async () => {
            const res = await request.get('/api/questions/1').set('authorization', user2AccessToken);

            expect(res.statusCode).toBe(403);
            expect(res.body).toStrictEqual<ErrorResponse>({
                error: 'You do not have access to the quiz question 1',
            });
        });
    });

    describe('PATCH /api/questions/:id', async () => {
        const updateQuestion: UpdateQuestion = {
            options: ['Updated option A', 'Updated option B'],
        };

        it('updates the question options and returns the updated question', async () => {
            const res = await request
                .patch('/api/questions/1')
                .send(updateQuestion)
                .set('authorization', user1AccessToken);

            const expectedQuestion = {
                ...quiz.questions[0],
                ...updateQuestion,
            };

            expect(res.statusCode).toBe(200);
            expect(res.body).toStrictEqual<QuizQuestion>({ ...expectedQuestion, quizId: 1 });

            quiz = {
                ...quiz,
                questions: [expectedQuestion, ...quiz.questions.filter((question, index) => index !== 0)],
            };
        });

        it('returns a not found response if there is no quiz question with the id', async () => {
            const res = await request
                .patch('/api/questions/5')
                .send(updateQuestion)
                .set('authorization', user1AccessToken);

            expect(res.statusCode).toBe(404);
            expect(res.body).toStrictEqual<ErrorResponse>({
                error: 'There is no quiz question with the id 5',
            });
        });

        it('returns a forbidden response if you cant modify the quiz question', async () => {
            const res = await request
                .patch('/api/questions/1')
                .send(updateQuestion)
                .set('authorization', user2AccessToken);

            expect(res.statusCode).toBe(403);
            expect(res.body).toStrictEqual<ErrorResponse>({
                error: 'Only the owner can update a quiz question',
            });
        });

        it('returns a bad request response if the correct option is no longer an index of options', async () => {
            const updateQuestion: UpdateQuestion = {
                options: ['Question A'],
            };

            const res = await request
                .patch('/api/questions/1')
                .send(updateQuestion)
                .set('authorization', user1AccessToken);

            expect(res.statusCode).toBe(400);
            expect(res.body).toStrictEqual<BadRequestResponse>({
                errors: [{ path: 'correctOption', message: 'The correct option must be an index of options' }],
            });
        });
    });

    describe('DELETE /api/questions/:id', async () => {
        it('deletes the quiz question specified', async () => {
            const res = await request.delete('/api/questions/3').set('authorization', user1AccessToken);

            expect(res.statusCode).toBe(204);
            expect(res.body).toStrictEqual({});
        });

        it('returns a not found response when there is no question with the id', async () => {
            const res = await request.delete('/api/questions/5').set('authorization', user1AccessToken);

            expect(res.statusCode).toBe(404);
            expect(res.body).toStrictEqual<ErrorResponse>({
                error: 'There is no quiz question with the id 5',
            });
        });

        it('returns a forbidden response if you cant modify a quiz question', async () => {
            const res = await request.delete('/api/questions/1').set('authorization', user2AccessToken);

            expect(res.statusCode).toBe(403);
            expect(res.body).toStrictEqual<ErrorResponse>({
                error: 'Only the owner can delete a quiz question',
            });
        });
    });

    describe('DELETE /api/questions', async () => {
        it('deletes the quiz questions specified', async () => {
            const questions: QuestionIds = {
                questionIds: [1, 2],
            };

            const res = await request.delete('/api/questions').send(questions).set('authorization', user1AccessToken);

            expect(res.statusCode).toBe(200);
            expect(res.body).toStrictEqual({ deletedCount: 2 });
        });

        it('returns a not found response when there is no question with the id', async () => {
            const questions: QuestionIds = {
                questionIds: [1, 2],
            };

            const res = await request.delete('/api/questions').send(questions).set('authorization', user1AccessToken);

            expect(res.statusCode).toBe(404);
            expect(res.body).toStrictEqual<ErrorResponse>({
                error: 'There is no quiz question with the ids 1,2',
            });
        });

        it('returns a forbidden response if you are not the owner of the quizzes', async () => {
            const questions: QuestionIds = {
                questionIds: [4],
            };

            const res = await request.delete('/api/questions').send(questions).set('authorization', user2AccessToken);

            expect(res.statusCode).toBe(403);
            expect(res.body).toStrictEqual<ErrorResponse>({
                error: 'You must be the owner of the quizzes 4 to delete them',
            });
        });
    });
});
