import { BadRequestErrorMessage } from '../types/augmentation/expressAugmentation';

export default class BadRequestError extends Error {
    private readonly errorMessages: BadRequestErrorMessage[];

    constructor(errors: BadRequestErrorMessage[]) {
        super();
        this.errorMessages = errors;
    }

    get errors() {
        return this.errorMessages;
    }
}
