import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';
import { RequestHandlers } from '../types/interfaces/requestHandlers';

export default function Use<ParamType = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = Query>(
    middleware: RequestHandler<ParamType, ResBody, ReqBody, ReqQuery>,
) {
    return function <Handler extends RequestHandlers<ParamType, ResBody, ReqBody, ReqQuery>>(
        target: any,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<Handler>,
    ) {
        const original = descriptor.value;
        if (!original) {
            return;
        }

        const handler = async function (
            this: ThisType<Handler>,
            req: Request<ParamType, ResBody, ReqBody, ReqQuery>,
            res: Response<ResBody>,
            next: NextFunction,
        ) {
            const nextFunction = (err?: any) => {
                if (err) {
                    next(err);
                } else {
                    Promise.resolve(original.call(this, req, res, next)).catch(next);
                }
            };

            await Promise.resolve(middleware(req, res, nextFunction));
        };

        return { value: handler as Handler };
    };
}
