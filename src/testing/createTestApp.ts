import { Express } from 'express';
import { Server } from 'http';
import { afterAll, beforeAll } from 'vitest';
import createApp from '../app/createApp';

let app: Express;
let server: Server;

beforeAll(() => {
    const application = createApp(8001);
    app = application.app;
    server = application.server;
});

export { app, server };
