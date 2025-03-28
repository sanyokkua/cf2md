import { isNullOrBlankString, joinStrings, splitString } from 'coreutilsts';
import { LineSeparator } from 'coreutilsts/dist/src/string/types';
import log from 'loglevel';
import { StringUtils } from '../types/util-types';

export class StringUtilsImpl implements StringUtils {
    isBlankString(value?: string | null): boolean {
        return isNullOrBlankString(value);
    }

    isValidNotBlankString(value?: string | null): value is string {
        return !(this.isBlankString(value) || typeof value !== 'string');
    }

    parseTemplateString(template: string): string[] {
        log.trace('Starting parseTemplateString');
        const variables: string[] = [];
        // Regular expression to match placeholders wrapped in ${...}.
        const regex = /\${([^}]+)}/g;
        let match: RegExpExecArray | null;

        // Loop through all matches in the template string.
        while ((match = regex.exec(template)) !== null) {
            // Log each found variable name from the match.
            log.debug(`Found variable: ${match[1]}`);
            variables.push(match[1]);
        }

        log.trace(`Completed parseTemplateString. Variables found: ${variables.join(', ')}`);
        return variables;
    }

    replaceTemplateVariables(template: string, values: Record<string, unknown>): string {
        log.trace('Starting replaceTemplateVariables');
        let result = template;

        // Iterate over each key in the values object.
        for (const key in values) {
            const value = values[key];
            // Construct the placeholder string to search for.
            const placeholder = `\${${key}}`;
            // Escape special characters to safely use the placeholder in a regular expression.
            const escapedPlaceholder = placeholder.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(escapedPlaceholder, 'g');

            // Replace all occurrences of the placeholder with the corresponding value.
            log.debug(`Replacing placeholder ${placeholder} with value:`, value);
            result = result.replace(regex, String(value));
        }

        log.trace('Completed replaceTemplateVariables');
        return result;
    }

    joinStrings(strings: string[], joinSymbol?: LineSeparator): string {
        return joinStrings(strings, joinSymbol);
    }

    splitString(value: string, separator?: LineSeparator): string[] {
        return splitString(value, separator);
    }
}
