import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnSub } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnSubIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {}

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('fnSub is called');
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_Sub);
        const value = object as FnSub;
        const subValue = value[CfIntrinsicFunctions.Fn_Sub];

        if (typeof subValue === 'string') {
            const extractedVariables = this.parseTemplateString(subValue);
            const variableValues: Record<string, unknown> = {};

            extractedVariables.forEach((variable) => {
                if (ctx.hasParameterName(variable)) {
                    log.trace(`fnSub: Variable "${variable}" found in cache`);
                    variableValues[variable] = ctx.getParameter(variable);
                } else {
                    log.warn(`fnSub: Variable "${variable}" not found in cache`);
                    throw new Error(`Expected variable "${variable}" is not found in cache`);
                }
            });

            const result = this.replaceTemplateVariables(subValue, variableValues);
            log.trace(`fnSub: Result after replacement: "${result}"`);
            return result;
        }

        if (Array.isArray(subValue)) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (subValue.length !== 2) {
                log.warn('fnSub: Array does not have exactly 2 elements', subValue);
                throw new Error('Expected array of size 2 for Fn::Sub');
            }

            // Destructure the array into a template string and a variables map.
            const [templateString, variablesMap] = subValue;
            if (typeof variablesMap !== 'object') {
                log.warn('fnSub: Second element (variables map) is not a valid object', variablesMap);
                throw new Error('Expected the second element of Fn::Sub array to be an object');
            }

            const variableValues: Record<string, unknown> = {};
            for (const key in variablesMap) {
                const mapVal = variablesMap[key];
                const resolvedValue = resolveValue(mapVal, ctx);
                if (resolvedValue === undefined || resolvedValue === null) {
                    log.warn(`fnSub: Variable "${key}" could not be resolved`);
                    throw new Error(`Value for variable "${key}" could not be resolved`);
                }
                variableValues[key] = resolvedValue;
            }

            const result = this.replaceTemplateVariables(templateString, variableValues);
            log.trace(`fnSub: Result after replacement: "${result}"`);
            return result;
        }

        log.warn('fnSub: Fn::Sub must be either a string or an array of two elements', subValue);
        throw new Error('Fn::Sub must be either a string or an array of two elements');
    }

    private parseTemplateString(template: string): string[] {
        log.trace('Starting parseTemplateString');
        const variables: string[] = [];
        // Regular expression to match placeholders wrapped in ${...}.
        const regex = /\${([^}]+)}/g;
        let match: RegExpExecArray | null;

        // Loop through all matches in the template string.
        while ((match = regex.exec(template)) !== null) {
            log.debug(`Found variable: ${match[1]}`);
            variables.push(match[1]);
        }

        log.trace(`Completed parseTemplateString. Variables found: ${variables.join(', ')}`);
        return variables;
    }

    private replaceTemplateVariables(template: string, values: Record<string, unknown>): string {
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
}
