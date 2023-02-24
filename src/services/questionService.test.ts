import { describe, expect, it } from 'vitest';
import BadRequestError from '../errors/badRequestError';
import { CreateQuestion } from '../models/zod/questionModel';
import { mockQuizQuestion } from '../testing/mocks/mockQuiz';
import { QuestionService } from './questionService';

describe('@Unit - Question Service', () => {
    describe('Validate Question', async () => {
        it('Throws a bad request error if the correct option is less than 0', async () => {
            const createQuestion: CreateQuestion = {
                ...mockQuizQuestion,
                correctOption: -1,
                options: ['A'],
            };

            expect(() => QuestionService.validateQuestion(createQuestion)).toThrowError(BadRequestError);
        });

        it('Throws a bad request error if the correct option is not an index of options', async () => {
            const createQuestion: CreateQuestion = {
                ...mockQuizQuestion,
                correctOption: 2,
                options: ['A'],
            };

            expect(() => QuestionService.validateQuestion(createQuestion)).toThrowError(BadRequestError);
        });

        it('Does not throw anything if the question is valid', async () => {
            const createQuestion: CreateQuestion = mockQuizQuestion;

            expect(() => QuestionService.validateQuestion(createQuestion)).not.toThrowError();
        });
    });

    describe('Validate Questions', async () => {
        it('Throws a bad request error if one of the correct options is less than 0', async () => {
            const questions: CreateQuestion[] = [
                mockQuizQuestion,
                mockQuizQuestion,
                { ...mockQuizQuestion, correctOption: -1, options: ['A'] },
            ];

            expect(() => QuestionService.validateQuestions(questions)).toThrowError(BadRequestError);
        });

        it('Throws a bad request error if one of the correct options is not an index of options', async () => {
            const questions: CreateQuestion[] = [
                mockQuizQuestion,
                { ...mockQuizQuestion, correctOption: 1, options: ['A'] },
                mockQuizQuestion,
            ];

            expect(() => QuestionService.validateQuestions(questions)).toThrowError(BadRequestError);
        });

        it('Does not throw anything if all of the questions are valid', async () => {
            const questions: CreateQuestion[] = [mockQuizQuestion, mockQuizQuestion];

            expect(() => QuestionService.validateQuestions(questions)).not.toThrowError();
        });
    });
});
