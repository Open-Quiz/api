import * as jose from 'jose';
import config from '../config';
import { TokenType } from '../types/enums/TokenType';

export namespace TokenService {
    export async function verifyToken(token: string, tokenType: TokenType): Promise<jose.JWTPayload> {
        const { payload } = await jose.jwtVerify(token, config.jwt.secret, { audience: tokenType });
        return payload;
    }

    export async function signAccessToken(userId: number): Promise<string> {
        return signToken(userId, TokenType.Access);
    }

    export async function signRefreshToken(userId: number): Promise<string> {
        return signToken(userId, TokenType.Refresh);
    }

    async function signToken(userId: number, tokenType: TokenType): Promise<string> {
        return await new jose.SignJWT({})
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setSubject(userId.toString())
            .setAudience(tokenType)
            .setExpirationTime(config.jwt.expiresIn[tokenType])
            .sign(config.jwt.secret);
    }
}
