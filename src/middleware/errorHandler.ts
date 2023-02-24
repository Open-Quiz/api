import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, ZodIssue } from 'zod';
import ApiError from '../errors/apiError';
import BadRequestError from '../errors/badRequestError';
import { BadRequestErrorMessage } from '../types/augmentation/expressAugmentation';

// For Express to register this middleware as an error handler it **must** have 4 parameters.
export default function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof ZodError) {
        return res.badRequest(err.errors.map(parseZodIssue));
    } else if (err instanceof BadRequestError) {
        return res.badRequest(err.errors);
    } else if (err instanceof ApiError) {
        return res.status(err.statusCode).json(err.body);
    } else {
        next(err);
    }
}

export function catchErrorWrapper(handler: RequestHandler): RequestHandler {
    return async (req, res, next) => {
        try {
            return await Promise.resolve(handler(req, res, next));
        } catch (err) {
            next(err);
        }
    };
}

function parseZodIssue(issue: ZodIssue): BadRequestErrorMessage {
    const path = issue.path.length === 0 ? undefined : issue.path.join('.');
    return {
        path,
        message: issue.message,
    };
}
