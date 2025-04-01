export class ParsingValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ParsingValidationError';
    }
}
