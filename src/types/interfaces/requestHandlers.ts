import { NextFunction, Request, Response } from 'express';

export type RequestHandlers<ParamType, BodyType> =
    | ((req: Request<ParamType, unknown, BodyType>, res: Response, next: NextFunction) => Promise<void> | void)
    | ((req: Request<ParamType, unknown, BodyType>, res: Response) => Promise<void> | void);
