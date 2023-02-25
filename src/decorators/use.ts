import { RequestHandler } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';
import { RequestHandlers } from '../types/interfaces/requestHandlers';
import { Constructor } from '../types/utility';

const MiddlewareMetadataKey = Symbol('middleware');

type DecoratorArguments<T> = [any, string, TypedPropertyDescriptor<T>] | [constructor: Constructor];

export function getMiddlewareMeta(target: any): RequestHandler<any, any, any, any>[] {
    return Reflect.getOwnMetadata(MiddlewareMetadataKey, target) ?? [];
}

export function deleteMiddlewareMeta(target: any) {
    Reflect.deleteProperty(target, MiddlewareMetadataKey);
}

export default function Use<ParamType = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = Query>(
    middleware: RequestHandler<ParamType, ResBody, ReqBody, ReqQuery>,
) {
    return function <Handler extends RequestHandlers<ParamType, ResBody, ReqBody, ReqQuery>>(
        ...args: DecoratorArguments<Handler>
    ) {
        let target: any;
        if (args.length === 1) {
            // Class decorator
            target = args[0];
        } else {
            // Method decorator
            target = args[2].value;
        }

        // TODO: Check if I should be inserting the middleware at the front
        const middlewares = getMiddlewareMeta(target);
        middlewares.push(middleware);
        Reflect.defineMetadata(MiddlewareMetadataKey, middlewares, target);
    };
}
