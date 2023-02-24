import { required } from '../utility/typing';

export default {
    api: {
        port: Number(process.env.PORT) || 8000,
    },
    jwt: {
        expiresIn: {
            access: required(process.env.JWT_ACCESS_EXPIRES_IN),
            refresh: required(process.env.JWT_REFRESH_EXPIRES_IN),
        },
        secret: new TextEncoder().encode(required(process.env.JWT_SECRET)),
    },
    google: {
        clientId: required(process.env.GOOGLE_CLIENT_ID),
    },
};
