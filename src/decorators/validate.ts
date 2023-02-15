import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodSchema } from 'zod';
import IdParam from '../types/interfaces/idParam';

export type ValidationOptions<ParamType, BodyType> = {
    param?: ZodSchema<ParamType>;
    body?: ZodSchema<BodyType>;
};

export default function Validate<ParamType = any, BodyType = any>(options: ValidationOptions<ParamType, BodyType>) {
    type Handler = (req: Request<ParamType, unknown, BodyType>, res: Response, next: NextFunction) => Promise<void>;

    return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<Handler>) {
        console.log('Validate');
        const original = descriptor.value;
        if (!original) {
            return;
        }

        const handler: Handler = async (req, res, next) => {
            try {
                if (options.param) {
                    req.params = await options.param.parseAsync(req.params);
                }
                if (options.body) {
                    req.body = await options.body.parseAsync(req.body);
                }

                original(req, res, next);
            } catch (err) {
                next(err);
            }
        };

        descriptor.value = handler;
    };
}
