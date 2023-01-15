import jwt, { JwtPayload, SignOptions, VerifyOptions } from 'jsonwebtoken';
import InvalidTokenError from '../errors/invalidTokenError';

export namespace TokenService {
    const Secret = process.env.JWT_SECRET as string;

    export const TokenTypes = {
        Access: 'access',
        Refresh: 'refresh',
    } as const;

    export async function verifyToken(token: string, options?: VerifyOptions): Promise<JwtPayload> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, Secret, options, (err, payload) => {
                if (err) {
                    reject(err);
                } else if (payload === undefined || typeof payload === 'string') {
                    reject(new InvalidTokenError(`Expected payload to be an object, got ${typeof payload}`));
                } else {
                    resolve(payload);
                }
            });
        });
    }

    export async function signAccessToken(userId: number) {
        return signToken(userId, {
            audience: TokenTypes.Access,
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '10d',
        });
    }

    export async function signRefreshToken(userId: number) {
        return signToken(userId, {
            audience: TokenTypes.Refresh,
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
        });
    }

    async function signToken(userId: number, options: Omit<SignOptions, 'subject'> = {}) {
        return new Promise<string>((resolve, reject) => {
            jwt.sign(
                {},
                Secret,
                {
                    ...options,
                    subject: userId.toString(),
                },
                (err, token) => {
                    if (token) resolve(token);
                    else reject(err);
                },
            );
        });
    }
}
