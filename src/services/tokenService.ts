import * as jose from 'jose';
import config from '../config';
import { ObjectValues } from '../types/utility';

export namespace TokenService {
    export const TokenType = {
        Access: 'access',
        Refresh: 'refresh',
    } as const;

    export type TokenType = ObjectValues<typeof TokenType>;

    export async function verifyToken(token: string, tokenType: TokenType) {
        const { payload } = await jose.jwtVerify(token, config.jwt.secret, { audience: tokenType });
        return payload;
    }

    export async function signAccessToken(userId: number) {
        return signToken(userId, TokenType.Access);
    }

    export async function signRefreshToken(userId: number) {
        return signToken(userId, TokenType.Refresh);
    }

    async function signToken(userId: number, tokenType: TokenType) {
        return await new jose.SignJWT({})
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setSubject(userId.toString())
            .setAudience(tokenType)
            .setExpirationTime(config.jwt.expiresIn[tokenType])
            .sign(config.jwt.secret);
    }
}
