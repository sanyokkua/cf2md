import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnSub } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnSubIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {
        log.trace('[FnSubIntrinsic.constructor] Entering constructor.');
        log.trace('[FnSubIntrinsic.constructor] intrinsicUtils:', this.intrinsicUtils);
        log.trace('[FnSubIntrinsic.constructor] Exiting constructor.');
    }

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('[FnSubIntrinsic.resolveValue] Entering with arguments:', { object, ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_Sub);
        const value = object as FnSub;
        const subValue = value[CfIntrinsicFunctions.Fn_Sub];
        log.debug('[FnSubIntrinsic.resolveValue] Extracted Fn::Sub value:', subValue);

        if (typeof subValue === 'string') {
            log.trace('[FnSubIntrinsic.resolveValue] Fn::Sub value is a string, calling resolveStringSubValue.');
            const result = this.resolveStringSubValue(subValue, ctx);
            log.trace('[FnSubIntrinsic.resolveValue] Exiting, returning:', result);
            return result;
        }

        if (Array.isArray(subValue)) {
            log.trace('[FnSubIntrinsic.resolveValue] Fn::Sub value is an array, calling resolveArraySubValue.');
            const result = this.resolveArraySubValue(subValue, ctx, resolveValue);
            log.trace('[FnSubIntrinsic.resolveValue] Exiting, returning:', result);
            return result;
        }

        this.throwError('Fn::Sub must be either a string or an array of two elements', subValue);
        // This line should not be reached due to throwError
    }

    private resolveStringSubValue(templateString: string, ctx: ResolvingContext): string {
        log.trace('[FnSubIntrinsic.resolveStringSubValue] Entering with arguments:', { templateString, ctx });
        const extractedVariables = this.parseTemplateString(templateString);
        log.debug('[FnSubIntrinsic.resolveStringSubValue] Extracted variables:', extractedVariables);
        const variableValues: Record<string, unknown> = {};

        for (const variable of extractedVariables) {
            if (ctx.hasParameterName(variable)) {
                log.trace(`[FnSubIntrinsic.resolveStringSubValue] Variable "${variable}" found in cache`);
                variableValues[variable] = ctx.getParameter(variable);
                log.debug(`[FnSubIntrinsic.resolveStringSubValue] Value for variable "${variable}":`, variableValues[variable]);
            } else {
                this.throwError(`Expected variable "${variable}" is not found in cache`, variable);
            }
        }
        log.debug('[FnSubIntrinsic.resolveStringSubValue] Variable values:', variableValues);

        const result = this.replaceTemplateVariables(templateString, variableValues);
        log.trace(`[FnSubIntrinsic.resolveStringSubValue] Result after replacement: "${result}"`);
        log.trace('[FnSubIntrinsic.resolveStringSubValue] Exiting, returning:', result);
        return result;
    }

    private resolveArraySubValue(subValue: [string, Record<string, unknown>], ctx: ResolvingContext, resolveValue: ValueResolverFunc): string {
        log.trace('[FnSubIntrinsic.resolveArraySubValue] Entering with arguments:', { subValue, ctx });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (subValue.length !== 2) {
            this.throwError('Expected array of size 2 for Fn::Sub', subValue);
        }

        const [templateString, variablesMap] = subValue;
        log.debug('[FnSubIntrinsic.resolveArraySubValue] Template string:', templateString);
        log.debug('[FnSubIntrinsic.resolveArraySubValue] Variables map:', variablesMap);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (typeof variablesMap !== 'object' || variablesMap === null) {
            this.throwError('Expected the second element of Fn::Sub array to be an object', variablesMap);
        }

        const variableValues: Record<string, unknown> = {};
        for (const key in variablesMap) {
            const mapVal = variablesMap[key];
            log.trace(`[FnSubIntrinsic.resolveArraySubValue] Resolving value for variable "${key}":`, mapVal);
            const resolvedValue = resolveValue(mapVal, ctx);
            log.debug(`[FnSubIntrinsic.resolveArraySubValue] Resolved value for variable "${key}":`, resolvedValue);
            if (resolvedValue === undefined || resolvedValue === null) {
                this.throwError(`Value for variable "${key}" could not be resolved`, mapVal);
            }
            variableValues[key] = resolvedValue;
        }
        log.debug('[FnSubIntrinsic.resolveArraySubValue] Resolved variable values:', variableValues);

        const result = this.replaceTemplateVariables(templateString, variableValues);
        log.trace(`[FnSubIntrinsic.resolveArraySubValue] Result after replacement: "${result}"`);
        log.trace('[FnSubIntrinsic.resolveArraySubValue] Exiting, returning:', result);
        return result;
    }

    private parseTemplateString(template: string): string[] {
        log.trace('[FnSubIntrinsic.parseTemplateString] Entering with argument:', { template });
        const variables: string[] = [];
        const regex = /\${([^}]+)}/g;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(template)) !== null) {
            log.debug(`[FnSubIntrinsic.parseTemplateString] Found variable: ${match[1]}`);
            variables.push(match[1]);
        }

        log.trace(`[FnSubIntrinsic.parseTemplateString] Completed. Variables found: ${variables.join(', ')}`);
        log.trace('[FnSubIntrinsic.parseTemplateString] Exiting, returning:', variables);
        return variables;
    }

    private replaceTemplateVariables(template: string, values: Record<string, unknown>): string {
        log.trace('[FnSubIntrinsic.replaceTemplateVariables] Entering with arguments:', { template, values });
        let result = template;

        for (const key in values) {
            const value = values[key];
            const placeholder = `\${${key}}`;
            const escapedPlaceholder = placeholder.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(escapedPlaceholder, 'g');

            log.debug(`[FnSubIntrinsic.replaceTemplateVariables] Replacing placeholder ${placeholder} with value:`, value);
            result = result.replace(regex, String(value));
        }

        log.trace('[FnSubIntrinsic.replaceTemplateVariables] Completed.');
        log.trace('[FnSubIntrinsic.replaceTemplateVariables] Exiting, returning:', result);
        return result;
    }

    private throwError(message: string, context?: unknown): never {
        log.warn(`[FnSubIntrinsic.throwError] ${message}`, context);
        throw new Error(`Fn::Sub - ${message}`);
    }
}
