import { response } from 'express';

export interface BadRequestError {
    path: string;
    message: string;
}

declare module 'express-serve-static-core' {
    export interface Response {
        ok(body: any): void;
        created(body: any): void;
        noContent(): void;
        badRequest(errors: BadRequestError[]): void;
        unauthorized(error: string): void;
        forbidden(error: string): void;
        notFound(error: string): void;
        internalServerError(error: string): void;
    }
}

response.ok = function (body) {
    this.status(200).json(body);
};

response.created = function (body) {
    this.status(201).json(body);
};

response.noContent = function () {
    this.sendStatus(204);
};

response.badRequest = function (errors) {
    this.status(400).json({ errors });
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

response.internalServerError = function (error) {
    this.status(500).json({ error });
};
