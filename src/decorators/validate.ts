import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export type ValidationOptions<ParamType, BodyType> = {
    param?: ZodSchema<ParamType>;
    body?: ZodSchema<BodyType>;
};

export default function Validate<ParamType = any, BodyType = any>(options: ValidationOptions<ParamType, BodyType>) {
    type Handler = (req: Request<ParamType, unknown, BodyType>, res: Response, next: NextFunction) => Promise<void>;

    return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<Handler>) {
        const original = descriptor.value;
        if (!original) {
            return;
        }

        const validationHandler: Handler = async function (this: ThisType<Handler>, req, res, next) {
            try {
                if (options.param) {
                    req.params = await options.param.parseAsync(req.params);
                }
                if (options.body) {
                    req.body = await options.body.parseAsync(req.body);
                }

                original.call(this, req, res, next);
            } catch (err) {
                next(err);
            }
        };

        return { value: validationHandler };
    };
}
