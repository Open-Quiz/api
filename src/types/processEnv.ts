declare namespace NodeJS {
    export interface ProcessEnv {
        PORT?: string;
        NODE_ENV?: string;
        JWT_ACCESS_EXPIRES_IN?: string;
        JWT_REFRESH_EXPIRES_IN?: string;
        JWT_SECRET: string;
        TEST_TYPE?: 'unit' | 'integration';
    }
}
