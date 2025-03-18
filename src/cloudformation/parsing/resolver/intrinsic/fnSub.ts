/* eslint-disable @typescript-eslint/no-unnecessary-condition*/
import log from 'loglevel';
import { UnexpectedParamError } from '../../../../errors/cloudformation-errors';
import { parseTemplateString, replaceTemplateVariables } from '../../../../utils/string-utils';
import { FnSub } from '../../../types/cloudformation-model';
import { MissingIntrinsicKeyError, UnexpectedVariableTypeError, WrongIntrinsicFormatError } from '../../errors/errors';
import { resolveValue, ResolvingContext } from '../../index';
import { IntrinsicFunc } from '../../types/types';
import { validateThatCorrectIntrinsicCalled } from './utils/intrinsic-utils';

/**
 * Resolves the "Fn::Sub" intrinsic function in an AWS CloudFormation template.
 *
 * This function is part of an AWS CloudFormation parser and handles the "Fn::Sub" intrinsic,
 * which is used to substitute variables in a string template with their actual values. The intrinsic
 * can be provided in two formats:
 *
 * 1. As a string:
 *    { "Fn::Sub": "string" }
 *    In this format, variables within the string are identified, searched within the context cache,
 *    and then replaced with their associated values.
 *
 * 2. As an array:
 *    { "Fn::Sub": [ "template string", { Var1Name: Var1Value, Var2Name: Var2Value } ] }
 *    In this format, the first element is the template string and the second element is an object
 *    mapping variable names to their values. Each value is resolved within the context.
 *
 * The resolution process is as follows:
 * - Validate that the intrinsic object contains the "Fn::Sub" key.
 * - If the intrinsic value is a string:
 *   a. Parse the string to extract variable names.
 *   b. For each variable, check if a resolved value exists in the context cache.
 *   c. If any variable is missing, throw a MissingIntrinsicKeyError.
 *   d. Replace the variables in the template string with their corresponding values.
 *
 * - If the intrinsic value is an array:
 *   a. Ensure the array has exactly 2 elements.
 *   b. Validate that the first element (the template) is a string.
 *   c. Validate that the second element (the variables map) is an object.
 *   d. Resolve each value in the variables map using the context.
 *   e. Replace template variables with the resolved values.
 *
 * @param node - The intrinsic function node containing the "Fn::Sub" key.
 * @param ctx - The resolving context that provides template data and methods for value resolution.
 * @returns The string result after performing variable substitutions in the template.
 * @throws WrongIntrinsicFormatError if the intrinsic array does not have exactly 2 elements, or if it is neither a string nor an array.
 * @throws MissingIntrinsicKeyError if a referenced variable in a string template is not found in the context cache.
 * @throws UnexpectedVariableTypeError if the types of the template string or variables map are not as expected.
 * @throws UnexpectedParamError if any variable value in the variables map cannot be resolved.
 */
export const fnSub: IntrinsicFunc = (node: unknown, ctx: ResolvingContext): unknown => {
    log.trace('fnSub is called');

    // Validate the intrinsic object has the correct "Fn::Sub" key.
    validateThatCorrectIntrinsicCalled(node, 'Fn::Sub');
    const value = node as FnSub;
    const subValue = value['Fn::Sub'];

    // If the intrinsic value is a string,
    // perform variable extraction and substitution using the context cache.
    if (typeof subValue === 'string') {
        // Extract variable names present in the template string.
        const extractedVariables = parseTemplateString(subValue);
        const variableValues: Record<string, unknown> = {};

        // For each variable, check if it exists in the context cache.
        extractedVariables.forEach((variable) => {
            if (ctx.hasParameterName(variable)) {
                log.trace(`fnSub: Variable "${variable}" found in cache`);
                variableValues[variable] = ctx.getParameter(variable);
            } else {
                log.warn(`fnSub: Variable "${variable}" not found in cache`);
                throw new MissingIntrinsicKeyError(`Expected variable "${variable}" is not found in cache`);
            }
        });

        // Replace variables in the template string with their corresponding values.
        const result = replaceTemplateVariables(subValue, variableValues);
        log.trace(`fnSub: Result after replacement: "${result}"`);
        return result;
    }

    // If the intrinsic value is an array,
    // it must contain exactly two elements: the template string and the variables map.
    if (Array.isArray(subValue)) {
        if (subValue.length !== 2) {
            log.warn('fnSub: Array does not have exactly 2 elements', subValue);
            throw new WrongIntrinsicFormatError('Expected array of size 2 for Fn::Sub');
        }

        // Destructure the array into a template string and a variables map.
        const [templateString, variablesMap] = subValue;

        // Validate that the template string is indeed a string.
        if (typeof templateString !== 'string') {
            log.warn('fnSub: First element (template string) is not a string', templateString);
            throw new UnexpectedVariableTypeError('Expected the first element of Fn::Sub array to be a string');
        }

        // Validate that the variables map is a valid object.
        if (typeof variablesMap !== 'object') {
            log.warn('fnSub: Second element (variables map) is not a valid object', variablesMap);
            throw new UnexpectedVariableTypeError('Expected the second element of Fn::Sub array to be an object');
        }

        // Resolve the values in the variables map.
        const variableValues: Record<string, unknown> = {};
        for (const key in variablesMap) {
            const mapVal = variablesMap[key];
            const resolvedValue = resolveValue(mapVal, ctx);
            if (resolvedValue === undefined || resolvedValue === null) {
                log.warn(`fnSub: Variable "${key}" could not be resolved`);
                throw new UnexpectedParamError(`Value for variable "${key}" could not be resolved`);
            }
            variableValues[key] = resolvedValue;
        }

        // Replace the variables in the template string with their resolved values.
        const result = replaceTemplateVariables(templateString, variableValues);
        log.trace(`fnSub: Result after replacement: "${result}"`);
        return result;
    }

    // If the intrinsic value is of an unexpected type, log a warning and throw an error.
    log.warn('fnSub: Fn::Sub must be either a string or an array of two elements', subValue);
    throw new WrongIntrinsicFormatError('Fn::Sub must be either a string or an array of two elements');
};
