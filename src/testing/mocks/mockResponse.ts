import { Response } from 'express';
import { vi } from 'vitest';

const mockResponse = () => {
    const res = {} as Response;

    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    res.badRequest = vi.fn().mockReturnValue(res);

    return res;
};

export default mockResponse;
