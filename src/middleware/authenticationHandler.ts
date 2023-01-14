import { NextFunction, Request, Response } from 'express';
import { TokenService } from '../services/tokenService';
import { z } from 'zod';
import prisma from '../client/instance';
import { JsonWebTokenError } from 'jsonwebtoken';

const UserIdModel = z.number().min(1);

export default async function AuthenticationHandler(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return res.unauthorized('Missing Bearer token from authorization header');
    }

    // The token is the string that follows 'Bearer '
    const token = req.headers.authorization.substring('Bearer '.length);

    try {
        const payload = await TokenService.verify(token);

        const userId = await UserIdModel.parseAsync(payload.sub);
        const requester = await prisma.user.findFirst({
            where: { id: userId },
        });

        if (!requester) {
            return res.unauthorized(`There is no user with the id ${userId}`);
        }

        // Store the requester as part of the request so that it can be accessed
        // in the various endpoints.
        req.requester = requester;
    } catch (err) {
        if (err instanceof JsonWebTokenError) {
            return res.unauthorized(err.message);
        }
        next(err);
    }
}
