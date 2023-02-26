import { Request, Response } from 'express';
import LoggedIn from '../decorators/authenticationHandler';
import Controller from '../decorators/controller';
import { Delete, Get, Patch, Post } from '../decorators/route';
import Validate from '../decorators/validate';
import { LinkProvider, LinkProviderModel } from '../models/zod/providerModel';
import { UpdateUser, UpdateUserModel } from '../models/zod/userModel';
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

    @LoggedIn
    @Patch('/@me')
    @Validate({ body: UpdateUserModel })
    public async updateSelf(req: Request<unknown, unknown, UpdateUser>, res: Response) {}

    @LoggedIn
    @Post('/@me/link')
    @Validate({ body: LinkProviderModel })
    public async linkProvider(req: Request<unknown, unknown, LinkProvider>, res: Response) {}

    @LoggedIn
    @Delete('/@me/data')
    public async deleteUserData(req: Request, res: Response) {}
}
