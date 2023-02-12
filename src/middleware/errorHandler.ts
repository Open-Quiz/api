import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodIssue } from 'zod';
import BadRequestError from '../errors/badRequestError';
import { BadRequestErrorMessage } from '../types/expressAugmentation';

// For Express to register this middleware as an error handler it **must** have 4 parameters.
export default function ErrorHandler(
    err: Error | ZodError | BadRequestError,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    if (err instanceof ZodError) {
        return res.badRequest(err.errors.map(parseZodIssue));
    } else if (err instanceof BadRequestError) {
        return res.badRequest(err.errors);
    }
}

function parseZodIssue(issue: ZodIssue): BadRequestErrorMessage {
    const path = issue.path.length === 0 ? undefined : issue.path.join('.');
    return {
        path,
        message: issue.message,
    };
}
