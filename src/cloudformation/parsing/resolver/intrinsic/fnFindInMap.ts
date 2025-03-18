/* eslint-disable @typescript-eslint/no-unnecessary-condition*/
import log from 'loglevel';
import { UnexpectedParamError } from '../../../../errors/cloudformation-errors';
import { FnFindInMap } from '../../../types/cloudformation-model';
import { UnexpectedVariableTypeError, WrongIntrinsicFormatError } from '../../errors/errors';
import { resolveValue, ResolvingContext } from '../../index';
import { IntrinsicFunc } from '../../types/types';
import { validateThatCorrectIntrinsicCalled } from './utils/intrinsic-utils';

/**
 * Processes the "Fn::FindInMap" intrinsic function to retrieve a mapping value from an AWS CloudFormation template.
 *
 * This function validates and resolves the intrinsic parameters: map name, top-level key, and second-level key.
 * It then searches for the corresponding value in the CloudFormation template's Mappings section. The resolution
 * and validation ensure that the parameters are correctly structured and that the mapping exists.
 *
 * Example intrinsic object:
 * { "Fn::FindInMap": [ "MapName", "TopLevelKey", "SecondLevelKey" ] }
 *
 * @param node - The intrinsic function node containing the "Fn::FindInMap" key.
 * @param ctx - The resolving context containing the original CloudFormation template and relevant resolution info.
 * @returns The value retrieved from the mapping corresponding to the provided keys.
 * @throws WrongIntrinsicFormatError if the intrinsic array does not contain exactly 3 items.
 * @throws UnexpectedVariableTypeError if any resolved parameter is not a string.
 * @throws UnexpectedParamError if the required mapping or key is missing in the template.
 */
export const fnFindInMap: IntrinsicFunc = (node: unknown, ctx: ResolvingContext): unknown => {
    log.trace('fnFindInMap is called');

    // Validate the intrinsic structure to ensure it includes the "Fn::FindInMap" key.
    validateThatCorrectIntrinsicCalled(node, 'Fn::FindInMap');

    // Cast the incoming node to the expected FnFindInMap structure.
    const value = node as FnFindInMap;

    // Ensure the intrinsic value is an array with exactly 3 items.
    if (!Array.isArray(value['Fn::FindInMap']) || value['Fn::FindInMap'].length !== 3) {
        log.warn('fnFindInMap: Incorrect format, expected 3 items', value['Fn::FindInMap']);
        throw new WrongIntrinsicFormatError('Expected 3 items in Fn::FindInMap array');
    }

    // Resolve each parameter from the intrinsic array:
    // 1. Map name,
    // 2. Top-level key, and
    // 3. Second-level key.
    const mapName = resolveValue(value['Fn::FindInMap'][0], ctx);
    const level1Key = resolveValue(value['Fn::FindInMap'][1], ctx);
    const level2Key = resolveValue(value['Fn::FindInMap'][2], ctx);

    // Validate that the resolved values are strings.
    if (typeof mapName !== 'string') {
        log.warn('fnFindInMap: MapName is not a string', mapName);
        throw new UnexpectedVariableTypeError('Expected map name to be a string');
    }
    if (typeof level1Key !== 'string') {
        log.warn('fnFindInMap: Level1Key is not a string', level1Key);
        throw new UnexpectedVariableTypeError('Expected top-level key to be a string');
    }
    if (typeof level2Key !== 'string') {
        log.warn('fnFindInMap: Level2Key is not a string', level2Key);
        throw new UnexpectedVariableTypeError('Expected second-level key to be a string');
    }

    // Ensure that the original template contains the Mappings section.
    if (!ctx.originalTemplate.Mappings) {
        log.warn('fnFindInMap: Template Mappings are missing');
        throw new UnexpectedParamError('Template Mappings are missing. Fn::FindInMap cannot search for a value');
    }

    // Retrieve the specified mapping from the original template.
    const mapping = ctx.originalTemplate.Mappings;
    const map = mapping[mapName];
    if (!map) {
        log.warn(`fnFindInMap: Mapping "${mapName}" not found in template Mappings`);
        throw new UnexpectedParamError(`Mapping with name "${mapName}" not found`);
    }

    // Retrieve the top-level mapping section for the given key.
    const level1Map = map[level1Key];
    if (!level1Map) {
        log.warn(`fnFindInMap: Mapping for key "${level1Key}" not found in mapping "${mapName}"`);
        throw new UnexpectedParamError(`Mapping for key "${level1Key}" not found in mapping "${mapName}"`);
    }

    // Retrieve the final value using the second-level key.
    const mapValue = level1Map[level2Key];
    if (mapValue === undefined || mapValue === null) {
        log.warn(
            `fnFindInMap: Value for key "${level2Key}" not found in mapping "${mapName}" at top-level key "${level1Key}"`,
        );
        throw new UnexpectedParamError(
            `Value for key "${level2Key}" not found in mapping "${mapName}" at top-level key "${level1Key}"`,
        );
    }

    log.trace(`fnFindInMap: Found value for map "${mapName}", level1 "${level1Key}", level2 "${level2Key}"`);
    return mapValue;
};
