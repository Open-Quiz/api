import * as jose from 'jose';
import { ObjectValues } from '../types/utilityTypes';

export namespace TokenService {
    const Secret = new TextEncoder().encode(process.env.JWT_SECRET);

    export const TokenType = {
        Access: 'access',
        Refresh: 'refresh',
    } as const;

    export type TokenType = ObjectValues<typeof TokenType>;

    export async function verifyToken(token: string, tokenType: TokenType) {
        const { payload } = await jose.jwtVerify(token, Secret, { audience: tokenType });
        return payload;
    }

    export async function signAccessToken(userId: number) {
        return signToken(userId, TokenType.Access, process.env.JWT_ACCESS_EXPIRES_IN ?? '10d');
    }

    export async function signRefreshToken(userId: number) {
        return signToken(userId, TokenType.Refresh, process.env.JWT_REFRESH_EXPIRES_IN ?? '30d');
    }

    async function signToken(userId: number, tokenType: TokenType, expiresIn: string) {
        return await new jose.SignJWT({})
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setSubject(userId.toString())
            .setAudience(tokenType)
            .setExpirationTime(expiresIn)
            .sign(Secret);
    }
}
