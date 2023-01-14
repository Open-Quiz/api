import jwt, { JwtPayload, VerifyOptions } from 'jsonwebtoken';

export namespace TokenService {
    export async function verify(token: string, options?: VerifyOptions): Promise<JwtPayload> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, options, (err, payload) => {
                if (err) {
                    reject(err);
                } else if (payload === undefined || typeof payload === 'string') {
                    // I can't find any documentation around what the payload is when it's just a string,
                    // so for now we'll just consider this an invalid token.
                    reject(`Expected payload, got ${typeof payload}`);
                } else {
                    resolve(payload);
                }
            });
        });
    }
}
