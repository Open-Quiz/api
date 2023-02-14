import * as jose from 'jose';
import config from '../config';
import { ObjectValues } from '../types/utility';

export const TokenType = {
    Access: 'access',
    Refresh: 'refresh',
} as const;

export type TokenType = ObjectValues<typeof TokenType>;

export class TokenService {
    public async verifyToken(token: string, tokenType: TokenType) {
        const { payload } = await jose.jwtVerify(token, config.jwt.secret, { audience: tokenType });
        return payload;
    }

    public async signAccessToken(userId: number) {
        return this.signToken(userId, TokenType.Access);
    }

    public async signRefreshToken(userId: number) {
        return this.signToken(userId, TokenType.Refresh);
    }

    private async signToken(userId: number, tokenType: TokenType) {
        return await new jose.SignJWT({})
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setSubject(userId.toString())
            .setAudience(tokenType)
            .setExpirationTime(config.jwt.expiresIn[tokenType])
            .sign(config.jwt.secret);
    }
}

const singleton = new TokenService();
export default singleton;
