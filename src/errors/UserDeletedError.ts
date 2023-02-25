import ApiError from './apiError';

export default class UserDeletedError extends ApiError {
    constructor(userId: number) {
        super(401, `The user ${userId} was deleted and cannot be accessed`);
    }
}
