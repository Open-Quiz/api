import { NextFunction, Request, Response } from 'express';
import { TokenService } from '../services/tokenService';
import * as jose from 'jose';
import prisma from '../client/instance';
import { TokenType } from '../types/enums/TokenType';

export default async function authenticationHandler(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
        return res.unauthorized('Missing access token from authorization header');
    }

    if (!req.headers.authorization.startsWith('Bearer ')) {
        return res.unauthorized("Access token must be prefixed with 'Bearer '");
    }

    // The token is the string that follows 'Bearer '
    const token = req.headers.authorization.substring('Bearer '.length);

    try {
        const payload = await TokenService.verifyToken(token, TokenType.Access);

        if (!payload.sub) {
            return res.unauthorized('Access token is missing subject in payload');
        }

        const userId = Number.parseInt(payload.sub);
        if (isNaN(userId)) {
            return res.unauthorized(
                `Access token subject is not a valid user id. Expected number, received ${payload.sub}`,
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
        if (err instanceof jose.errors.JWTClaimValidationFailed && err.claim === 'aud') {
            return res.unauthorized('Provided token is not an access token');
        }
        if (err instanceof jose.errors.JOSEError) {
            return res.unauthorized(err.message);
        }

        next(err);
    }
}
