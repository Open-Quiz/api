import { response } from 'express';

declare module 'express-serve-static-core' {
    export interface Response {
        ok(body: any): void;
        created(body: any): void;
        badRequest(error: string): void;
        unauthorized(error: string): void;
        forbidden(error: string): void;
        notFound(error: string): void;
    }
}

response.ok = function (body) {
    this.status(200).json(body);
};

response.created = function (body) {
    this.status(201).json(body);
};

response.badRequest = function (error) {
    this.status(400).json({ error });
};

response.unauthorized = function (error) {
    this.status(401).json({ error });
};

response.forbidden = function (error) {
    this.status(403).json({ error });
};

response.notFound = function (error) {
    this.status(404).json({ error });
};
