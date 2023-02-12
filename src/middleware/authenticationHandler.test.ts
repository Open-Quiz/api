import { describe, expect, it } from 'vitest';
import { ErrorResponse } from '../types/expressAugmentation';
import { TokenService } from '../services/tokenService';
import * as jose from 'jose';
import request from '../testing/request';
import setupTestApp from '../testing/setupTestApp';

setupTestApp();

describe('@Integration - Authentication Handler', () => {
    it('returns unauthorized request if there is no authorization header', async () => {
        const res = await request.get('/api/quizzes');

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual<ErrorResponse>({
            error: 'Missing access token from authorization header',
        });
    });

    it("returns unauthorized request if the authorization header doesn't start with 'Bearer '", async () => {
        const res = await request.get('/api/quizzes').set('authorization', 'test');

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual<ErrorResponse>({
            error: "Access token must be prefixed with 'Bearer '",
        });
    });

    it('returns unauthorized request if the token is not an access token', async () => {
        const token = await TokenService.signRefreshToken(1);

        const res = await request.get('/api/quizzes').set('authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual<ErrorResponse>({
            error: 'Provided token is not an access token',
        });
    });

    it("returns unauthorized request if the token payload doesn't have a subject", async () => {
        const token = await new jose.SignJWT({})
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setAudience(TokenService.TokenType.Access)
            .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN!)
            .sign(new TextEncoder().encode(process.env.JWT_SECRET));

        const res = await request.get('/api/quizzes').set('authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual<ErrorResponse>({
            error: 'Access token is missing subject in payload',
        });
    });

    it('returns unauthorized request if the token subject is not a valid id', async () => {
        const token = await new jose.SignJWT({})
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setAudience(TokenService.TokenType.Access)
            .setSubject('Invalid user id')
            .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN!)
            .sign(new TextEncoder().encode(process.env.JWT_SECRET));

        const res = await request.get('/api/quizzes').set('authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual<ErrorResponse>({
            error: 'Access token subject is not a valid user id. Expected number, received Invalid user id',
        });
    });

    it('returns unauthorized request if there is no user associated with the token', async () => {
        const token = await TokenService.signAccessToken(1);

        const res = await request.get('/api/quizzes').set('authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual<ErrorResponse>({
            error: 'There is no user with the id 1',
        });
    });

    it('returns unauthorized request if the access token is malformed', async () => {
        const res = await request.get('/api/quizzes').set('authorization', 'Bearer test');

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual<ErrorResponse>({
            error: 'Invalid Compact JWS',
        });
    });
});
