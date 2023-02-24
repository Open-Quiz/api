import { ZodSchema } from 'zod';
import Use from './use';

export type ValidationOptions<ParamType, BodyType> = {
    param?: ZodSchema<ParamType>;
    body?: ZodSchema<BodyType>;
};

export default function Validate<ParamType = any, BodyType = any>(options: ValidationOptions<ParamType, BodyType>) {
    return Use<ParamType, unknown, BodyType>(async (req, res, next) => {
        if (options.param) {
            req.params = await options.param.parseAsync(req.params);
        }
        if (options.body) {
            req.body = await options.body.parseAsync(req.body);
        }

        next();
    });
}
