import { isNullOrBlankString, joinStrings, splitString } from 'coreutilsts';
import { LineSeparator } from 'coreutilsts/dist/src/string/types';
import log from 'loglevel';
import * as velocityDef from 'velocityjs';
import { RenderContext } from 'velocityjs';
import { StringUtils } from '../types/util-types';

export class StringUtilsImpl implements StringUtils {
    isBlankString(value?: string | null): boolean {
        log.trace('[StringUtilsImpl.isBlankString] Entering with arguments:', { value });
        const result = isNullOrBlankString(value);
        log.trace('[StringUtilsImpl.isBlankString] Exiting with result:', result);
        return result;
    }

    isValidNotBlankString(value?: string | null): value is string {
        log.trace('[StringUtilsImpl.isValidNotBlankString] Entering with arguments:', { value });
        const isBlank = this.isBlankString(value);
        log.debug('[StringUtilsImpl.isValidNotBlankString] isBlankString result:', isBlank);
        const isString = typeof value === 'string';
        log.debug("[StringUtilsImpl.isValidNotBlankString] typeof value === 'string':", isString);
        const result = !isBlank && isString;
        log.trace('[StringUtilsImpl.isValidNotBlankString] Exiting with result:', result);
        return result;
    }

    parseTemplateString(template: string): string[] {
        log.trace('[StringUtilsImpl.parseTemplateString] Entering with arguments:', { template });
        const variables: string[] = [];
        // Regular expression to match placeholders wrapped in ${...}.
        const regex = /\${([^}]+)}/g;
        let match: RegExpExecArray | null;

        // Loop through all matches in the template string.
        while ((match = regex.exec(template)) !== null) {
            // Log each found variable name from the match.
            const variableName = match[1];
            log.debug('[StringUtilsImpl.parseTemplateString] Found variable:', variableName);
            variables.push(variableName);
        }

        log.trace('[StringUtilsImpl.parseTemplateString] Exiting with result:', variables);
        return variables;
    }

    replaceTemplateVariables(template: string, values: Record<string, unknown>): string {
        log.trace('[StringUtilsImpl.replaceTemplateVariables] Entering with arguments:', { template, values });
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
            log.debug('[StringUtilsImpl.replaceTemplateVariables] Replacing placeholder:', placeholder, 'with value:', value);
            result = result.replace(regex, String(value));
        }

        log.trace('[StringUtilsImpl.replaceTemplateVariables] Exiting with result:', result);
        return result;
    }

    joinStrings(strings: string[], joinSymbol?: LineSeparator): string {
        log.trace('[StringUtilsImpl.joinStrings] Entering with arguments:', { strings, joinSymbol });
        const result = joinStrings(strings, joinSymbol);
        log.trace('[StringUtilsImpl.joinStrings] Exiting with result:', result);
        return result;
    }

    splitString(value: string, separator?: LineSeparator): string[] {
        log.trace('[StringUtilsImpl.splitString] Entering with arguments:', { value, separator });
        const result = splitString(value, separator);
        log.trace('[StringUtilsImpl.splitString] Exiting with result:', result);
        return result;
    }

    renderVelocityJsonString(value: string, stageVariables?: Record<string, string>): string {
        const context: RenderContext = {
            input: {
                json: (input: string) => {
                    return JSON.stringify(input);
                },
                path: () => {
                    return {};
                },
                params: (input: string) => input,
                body: 'stub',
                method: 'stub',
                headers: (input: string) => input,
            },
            stageVariables: stageVariables,
            util: {
                escapeJavaScript: (input: string) => input.replace(/'/g, "\\'"),
                parseJson: (input: string): unknown => JSON.parse(input),
                urlEncode: (input: string) => input,
                urlDecode: (input: string) => input,
                base64Encode: (input: string) => input,
                base64Decode: (input: string) => input,
                toJson: (input: unknown) => JSON.stringify(input),
            },
        };

        const rendered = velocityDef.render(value, context);
        const normalize = rendered.replace(/"{2,}/g, '"').replace(/'{2,}/g, "'").replace(/\n/, '').replace(/\n\r/, '').replace(/\r/, '');
        try {
            const parsedJson = JSON.parse(normalize);
            return JSON.stringify(parsedJson, null, 0);
        } catch (error: unknown) {
            log.error('Rendered template is not valid JSON:', error);
            return '';
        }
    }
}
