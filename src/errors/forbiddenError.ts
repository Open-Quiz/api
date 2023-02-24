import ApiError from './apiError';

export default class ForbiddenError extends ApiError {
    constructor(message: string) {
        super(403, message);
    }
}
