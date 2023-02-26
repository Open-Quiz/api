import { Request, Response } from 'express';
import LoggedIn from '../decorators/authenticationHandler';
import Controller from '../decorators/controller';
import { Delete, Get, Post } from '../decorators/route';
import Validate from '../decorators/validate';
import BadRequestError from '../errors/badRequestError';
import { LinkProvider, LinkProviderModel } from '../models/zod/providerModel';
import { TokenService } from '../services/tokenService';
import { UserDataService } from '../services/userDataService';
import { UserService } from '../services/userService';

@Controller('/users')
export class UserController {
    @Post('/login')
    public async login(req: Request, res: Response) {
        if (!req.headers.authorization) {
            return res.unauthorized(`Missing required authorization header in the format <provider> <token>`);
        }

        const [provider, token] = req.headers.authorization.split(' ', 2);
        if (!UserService.isValidProvider(provider)) {
            return res.unauthorized(`The login provider ${provider} is not supporter`);
        }

        const { user, wasSignedUp } = await UserService.login(provider, token);
        const responseData = {
            user,
            token: TokenService.signAccessToken(user.id),
        };

        if (wasSignedUp) {
            return res.created(responseData);
        }

        res.ok(responseData);
    }

    @LoggedIn
    @Get('/@me')
    public async getSelf(req: Request, res: Response) {
        const user = await UserService.getUserByIdWithData(req.requester.id);
        res.ok(user);
    }

    @LoggedIn
    @Delete('/@me')
    public async deleteSelf(req: Request, res: Response) {
        await UserService.deleteUser(req.requester.id);
        res.noContent();
    }

    @LoggedIn
    @Post('/@me/link')
    @Validate({ body: LinkProviderModel })
    public async linkProvider(req: Request<unknown, unknown, LinkProvider>, res: Response) {
        const upatedUser = await UserService.linkProvider(
            req.requester.id,
            req.body.provider,
            req.body.token,
            req.body.makeMainProvider ?? false,
        );

        res.ok(upatedUser);
    }

    @LoggedIn
    @Delete('/@me/data')
    public async deleteUserData(req: Request, res: Response) {
        await UserDataService.deleteUserData(req.requester.id);
        res.noContent();
    }
}
