import { ObjectValues } from '../utility';

export const Method = {
    GET: 'GET',
    POST: 'POST',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
} as const;

export type Method = ObjectValues<typeof Method>;
