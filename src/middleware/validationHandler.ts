import { ZodSchema } from 'zod';
import { RequestHandler } from 'express';

export type ValidationOptions<ParamType, BodyType> = {
    param?: ZodSchema<ParamType>;
    body?: ZodSchema<BodyType>;
};

export default function validate<ParamType = unknown, BodyType = unknown>(
    options: ValidationOptions<ParamType, BodyType>,
): RequestHandler<ParamType, unknown, BodyType> {
    return async (req, res, next) => {
        try {
            if (options.param) {
                req.params = await options.param.parseAsync(req.params);
            }
            if (options.body) {
                req.body = await options.body.parseAsync(req.body);
            }

            next();
        } catch (err) {
            next(err);
        }
    };
}
