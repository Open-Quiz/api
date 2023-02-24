import { Request, RequestHandler } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';
import BadRequestError from '../errors/badRequestError';
import ForbiddenError from '../errors/forbiddenError';
import NotFoundError from '../errors/notFoundError';
import mockResponse from '../testing/mocks/mockResponse';
import errorHandler, { catchErrorWrapper } from './errorHandler';

describe('@Unit - Error Handler', () => {
    const req = {} as Request;

    describe('Error Handler', () => {
        it('returns a bad request response if the error is an instance of ZodError', async () => {
            const res = mockResponse();
            const err = new ZodError([{ path: ['test', 'path'], message: 'Test message', code: 'custom' }]);
            const next = vi.fn();

            errorHandler(err, req, res, next);

            expect(res.badRequest).toHaveBeenCalledWith([{ path: 'test.path', message: 'Test message' }]);
        });

        it('returns a bad request response if the error is an instance of BadRequestError', async () => {
            const res = mockResponse();
            const err = new BadRequestError([{ path: 'test', message: 'Test message' }]);
            const next = vi.fn();

            errorHandler(err, req, res, next);

            expect(res.badRequest).toHaveBeenCalledWith([{ path: 'test', message: 'Test message' }]);
        });

        it('returns a forbidden response if the error is an instance of ForbiddenError', async () => {
            const res = mockResponse();
            const err = new ForbiddenError('Forbidden error message');
            const next = vi.fn();

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Forbidden error message',
            });
        });

        it('returns a not found response if the error is an instance of NotFoundError', async () => {
            const res = mockResponse();
            const err = new NotFoundError('Not found error message');
            const next = vi.fn();

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Not found error message',
            });
        });

        it('passes the error to the next function if it does not match any of the other errors', async () => {
            const res = mockResponse();
            const err = new Error('Error');
            const next = vi.fn();

            errorHandler(err, req, res, next);

            expect(next).toHaveBeenCalledOnce();
        });
    });

    describe('Catch Error Wrapper', () => {
        it('catches the thrown error and passes it to the next function', () => {
            const res = mockResponse();
            const next = vi.fn();

            const err = new Error('Test error message');

            const handler: RequestHandler = () => {
                throw err;
            };

            const wrappedHandler = catchErrorWrapper(handler);
            wrappedHandler(req, res, next);

            expect(next).toBeCalled();
        });

        it('does not call the next function if no error is thrown', () => {
            const res = mockResponse();
            const next = vi.fn();

            const handler: RequestHandler = () => {};

            const wrappedHandler = catchErrorWrapper(handler);
            wrappedHandler(req, res, next);

            expect(next).not.toBeCalled();
        });
    });
});
