import { Express } from 'express';
import { beforeAll } from 'vitest';
import createApp from '../app/createApp';

let app: Express;

beforeAll(() => {
    app = createApp(8001);
});

export { app };
