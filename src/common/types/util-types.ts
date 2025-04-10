import { LineSeparator } from 'coreutilsts/dist/src/string/types';

export interface StringUtils {
    isBlankString(value?: string | null): boolean;
    isValidNotBlankString(value?: string | null): value is string;
    parseTemplateString(template: string): string[];
    replaceTemplateVariables(template: string, values: Record<string, unknown>): string;
    joinStrings(strings: string[], joinSymbol?: LineSeparator): string;
    splitString(value: string, separator?: LineSeparator): string[];
    renderVelocityJsonString(value: string, stageVariables?: Record<string, string>): string;
}
