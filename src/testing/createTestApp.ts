import { Express } from 'express';
import { Server } from 'http';
import { beforeAll, afterAll } from 'vitest';
import createApp from '../app/createApp';

let app: Express;
let server: Server;

beforeAll(() => {
    const application = createApp();
    app = application.app;
    server = application.server;
});

afterAll(() => {
    server.close();
});

export { app, server };
