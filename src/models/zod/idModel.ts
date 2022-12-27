import { number, object } from 'zod';

const IdModel = object({
    id: number().int().positive(),
});

export default IdModel;
