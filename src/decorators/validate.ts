import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodSchema } from 'zod';
import { RequestHandlers } from '../types/interfaces/requestHandlers';

export type ValidationOptions<ParamType, BodyType> = {
    param?: ZodSchema<ParamType>;
    body?: ZodSchema<BodyType>;
};

export default function Validate<ParamType = any, BodyType = any>(options: ValidationOptions<ParamType, BodyType>) {
    return function <Handler extends RequestHandlers<ParamType, BodyType>>(
        target: any,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<Handler>,
    ) {
        const original = descriptor.value;
        if (!original) {
            return;
        }

        const validationHandler = async function (
            this: ThisType<Handler>,
            req: Request<ParamType, unknown, BodyType>,
            res: Response,
            next: NextFunction,
        ) {
            if (options.param) {
                req.params = await options.param.parseAsync(req.params);
            }
            if (options.body) {
                req.body = await options.body.parseAsync(req.body);
            }

            await original.call(this, req, res, next);
        };

        return { value: validationHandler as Handler };
    };
}
