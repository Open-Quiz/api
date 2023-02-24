import { Provider, User } from '@prisma/client';

export const mockUser: Omit<User, 'id'> = {
    isBot: false,
    mainProvider: Provider.Google,
};
