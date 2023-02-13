function required<T>(value: T | undefined): T {
    if (value === undefined) {
        throw new Error('Missing required environment variable');
    }
    return value;
}

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
};
