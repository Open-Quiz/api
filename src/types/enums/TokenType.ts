import { ObjectValues } from '../utility';

export const TokenType = {
    Access: 'access',
    Refresh: 'refresh',
} as const;

export type TokenType = ObjectValues<typeof TokenType>;
