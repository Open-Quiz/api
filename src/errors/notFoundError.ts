import ApiError from './apiError';

export default class NotFoundError extends ApiError {
    constructor(message: string) {
        super(404, message);
    }
}
