import { Express } from 'express';

export default interface Controller {
    applyRoutes(app: Express): void;
}
