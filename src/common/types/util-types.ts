export interface StringUtils {
    isBlankString(value?: string | null): boolean;
    isValidNotBlankString(value?: string | null): value is string;
    parseTemplateString(template: string): string[];
    replaceTemplateVariables(template: string, values: Record<string, unknown>): string;
}
