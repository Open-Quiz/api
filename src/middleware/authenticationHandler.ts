import { NextFunction, Request, Response } from 'express';
import { TokenService } from '../services/tokenService';
import prisma from '../client/instance';
import { JsonWebTokenError } from 'jsonwebtoken';
import InvalidTokenError from '../errors/invalidTokenError';

export default async function authenticationHandler(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return res.unauthorized('Missing access token from authorization header');
    }

    // The token is the string that follows 'Bearer '
    const token = req.headers.authorization.substring('Bearer '.length);

    try {
        const payload = await TokenService.verifyToken(token);

        if (!payload.aud || payload.aud !== 'access') {
            return res.unauthorized('Provided token is not an access token');
        }

        if (!payload.sub) {
            return res.unauthorized('Access token is missing subject in payload');
        }

        const userId = Number.parseInt(payload.sub);
        if (isNaN(userId)) {
            return res.unauthorized(
                `Access token subject is not a valid user id. Expected number, received ${typeof payload.sub}`,
            );
        }

        const requester = await prisma.user.findFirst({
            where: { id: userId },
        });

        if (!requester) {
            return res.unauthorized(`There is no user with the id ${userId}`);
        }

        // Store the requester as part of the request so that it can be accessed
        // in the various endpoints.
        req.requester = requester;
        next();
    } catch (err) {
        if (err instanceof JsonWebTokenError || err instanceof InvalidTokenError) {
            return res.unauthorized(err.message);
        }
        next(err);
    }
}
