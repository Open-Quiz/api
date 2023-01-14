import jwt, { JwtPayload, VerifyOptions } from 'jsonwebtoken';
import InvalidTokenError from '../errors/invalidTokenError';

export namespace TokenService {
    export async function verifyToken(token: string, options?: VerifyOptions): Promise<JwtPayload> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, options, (err, payload) => {
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

    export async function createAccessToken(userId: number): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.sign(
                {},
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRES_IN,
                    subject: userId.toString(),
                    audience: 'access',
                },
                (err, token) => {
                    if (token) resolve(token);
                    else reject(err);
                },
            );
        });
    }
}
