export default class ApiError extends Error {
    private httpStatusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.httpStatusCode = statusCode;
    }

    get statusCode() {
        return this.httpStatusCode;
    }

    get body() {
        return { error: this.message };
    }
}
