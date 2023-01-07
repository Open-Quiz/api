import { Express } from 'express';
import { Server } from 'http';
import { beforeAll } from 'vitest';
import createApp from '../app/createApp';

let app: Express;
let server: Server;

beforeAll(() => {
    const application = createApp();
    app = application.app;
    server = application.server;
});

export { app, server };
