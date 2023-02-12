import { User } from '@prisma/client';
import { response } from 'express';

export interface BadRequestErrorMessage {
    path?: string;
    message: string;
}

export interface BadRequestResponse {
    errors: BadRequestErrorMessage[];
}

export interface ErrorResponse {
    error: string;
}

declare module 'express-serve-static-core' {
    export interface Response {
        /**
         * @status 200
         */
        ok(body: any): void;
        /**
         * @status 201
         */
        created(body: any): void;
        /**
         * @status 204
         */
        noContent(): void;
        /**
         * @status 400
         */
        badRequest(errors: BadRequestErrorMessage[]): void;
        /**
         * @status 401
         */
        unauthorized(error: string): void;
        /**
         * @status 403
         */
        forbidden(error: string): void;
        /**
         * @status 404
         */
        notFound(error: string): void;
    }

    export interface Request {
        requester: User;
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
