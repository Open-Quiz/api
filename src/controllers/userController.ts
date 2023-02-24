import { Request, Response } from 'express';
import Controller from '../decorators/controller';
import { Get, Post } from '../decorators/route';

@Controller('/users')
export class UserController {
    @Post('/login')
    public async login(req: Request, res: Response) {}

    @Get('/@me')
    public async getSelf(req: Request, res: Response) {
        res.ok(req.requester);
    }
}
