import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { BadRequestError } from '../types/response';

// For Express to register this middleware as an error handler it **must**
// have 4 parameters.
export default function ErrorHandler(err: Error | ZodError, req: Request, res: Response, next: NextFunction) {
    if (err instanceof ZodError) {
        return res.badRequest(err.errors.map(parseZodIssue));
    }

    res.internalServerError('Something unknown went wrong');
}

function parseZodIssue(issue: ZodIssue): BadRequestError {
    return {
        path: issue.path.join('.'),
        message: issue.message,
    };
}
