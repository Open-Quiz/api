import { Request, Response } from 'express';
import LoggedIn from '../decorators/authenticationHandler';
import Controller from '../decorators/controller';
import { Get, Post } from '../decorators/route';
import Validate from '../decorators/validate';

@Controller('/users')
export class UserController {
    @Post('/login')
    public async login(req: Request, res: Response) {}

    @LoggedIn
    @Get('/@me')
    public async getSelf(req: Request, res: Response) {
        res.ok(req.requester);
    }
}
