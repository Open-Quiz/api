import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '../testing/createTestApp';
import { ErrorResponse } from '../types/expressAugmentation';
import { TokenService } from '../services/tokenService';
import mockPrisma from '../client/__mocks__/instance';
import * as jose from 'jose';

vi.mock('../client/instance');

describe('Authentication Handler', () => {
    it('returns unauthorized request if there is no authorization header', async () => {
        const res = await request(app).get('/api/quizzes');

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual<ErrorResponse>({
            error: 'Missing access token from authorization header',
        });
    });

    it("returns unauthorized request if the authorization header doesn't start with 'Bearer '", async () => {
        const res = await request(app).get('/api/quizzes').set('authorization', 'test');

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual<ErrorResponse>({
            error: "Access token must be prefixed with 'Bearer '",
        });
    });

    it('returns unauthorized request if the token is not an access token', async () => {
        const token = await TokenService.signRefreshToken(1);

        const res = await request(app).get('/api/quizzes').set('authorization', `Bearer ${token}`);

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

        const res = await request(app).get('/api/quizzes').set('authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual<ErrorResponse>({
            error: 'Access token is missing subject in payload',
        });
    });

    it('returns unauthorized request if there is no user associated with the token', async () => {
        const token = await TokenService.signAccessToken(2);

        mockPrisma.quiz.findFirst.mockResolvedValue(null);

        const res = await request(app).get('/api/quizzes').set('authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual<ErrorResponse>({
            error: 'There is no user with the id 2',
        });
    });

    it('returns unauthorized request if the access token is malformed', async () => {
        const res = await request(app).get('/api/quizzes').set('authorization', 'Bearer test');

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual<ErrorResponse>({
            error: 'Invalid Compact JWS',
        });
    });
});