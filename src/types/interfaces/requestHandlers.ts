import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';

export type RequestHandlers<ParamType = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = Query> =
    | ((
          req: Request<ParamType, ResBody, ReqBody, ReqQuery>,
          res: Response<ResBody>,
          next: NextFunction,
      ) => Promise<void> | void)
    | ((req: Request<ParamType, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>) => Promise<void> | void);
