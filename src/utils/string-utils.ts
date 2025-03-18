import log from 'loglevel';

/**
 * Extracts variable placeholders from a template string.
 *
 * This function scans a template string for variables that are denoted by the `${...}` syntax.
 * It uses a regular expression to match all placeholders and returns an array of the variable names
 * found inside the curly braces.
 *
 * @param template - The template string that contains placeholder variables in the format `${variable}`.
 * @returns An array of variable names that were found in the template.
 *
 * @example
 * // Given the template "Hello, ${name}!", it returns ["name"].
 */
export function parseTemplateString(template: string): string[] {
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

/**
 * Replaces placeholder variables in a template string with provided values.
 *
 * This function substitutes each placeholder (formatted as `${key}`) in the given template
 * string with the corresponding value from the provided object. It iterates through each key in
 * the values object, escapes the placeholder for safe usage in a regular expression, and replaces
 * all occurrences of the placeholder with its value.
 *
 * @param template - The template string containing placeholders in the format `${key}`.
 * @param values - An object mapping placeholder names to their replacement values.
 * @returns The template string with all placeholders replaced by their corresponding values.
 *
 * @example
 * // Given the template "Value: ${val}" and values { val: 42 }, this returns "Value: 42".
 */
export function replaceTemplateVariables(template: string, values: Record<string, unknown>): string {
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
