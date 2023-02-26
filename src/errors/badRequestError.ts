import { BadRequestErrorMessage } from '../types/augmentation/expressAugmentation';

export default class BadRequestError extends Error {
    private readonly errorMessages: BadRequestErrorMessage[];

    constructor(errors: BadRequestErrorMessage | BadRequestErrorMessage[]) {
        super();
        this.errorMessages = Array.isArray(errors) ? errors : [errors];
    }

    get errors() {
        return this.errorMessages;
    }
}
