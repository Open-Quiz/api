import { Request, Response } from 'express';
import LoggedIn from '../decorators/authenticationHandler';
import Controller from '../decorators/controller';
import { Get, Post } from '../decorators/route';
import { UserService } from '../services/userService';

@Controller('/users')
export class UserController {
    @Post('/login')
    public async login(req: Request, res: Response) {
        if (!req.headers.authorization) {
            return res.unauthorized(`Missing required authorization header in the format <provider> <token>`);
        }

        const [provider, token] = req.headers.authorization.split(' ', 2);
        return await UserService.login(provider, token);
    }

    @LoggedIn
    @Get('/@me')
    public async getSelf(req: Request, res: Response) {
        const user = await UserService.getUserByIdWithData(req.requester.id);
        res.ok(user);
    }
}
