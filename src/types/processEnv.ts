declare namespace NodeJS {
    export interface ProcessEnv {
        PORT?: string;
        NODE_ENV?: string;
        JWT_EXPIRES_IN: string;
        JWT_SECRET: string;
    }
}
