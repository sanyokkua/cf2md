/**
 * Error thrown when the template parsing result is invalid.
 */
export class TemplateProcessingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TemplateProcessingError';
    }
}
