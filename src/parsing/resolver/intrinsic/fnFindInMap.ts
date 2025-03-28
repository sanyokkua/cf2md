import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnFindInMap } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnFindInMapIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {}

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('fnFindInMap is called');
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_FindInMap);

        // Cast the incoming node to the expected FnFindInMap structure.
        const value = object as FnFindInMap;

        // Ensure the intrinsic value is an array with exactly 3 items.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!Array.isArray(value[CfIntrinsicFunctions.Fn_FindInMap]) || value[CfIntrinsicFunctions.Fn_FindInMap].length !== 3) {
            log.warn('fnFindInMap: Incorrect format, expected 3 items', value[CfIntrinsicFunctions.Fn_FindInMap]);
            throw new Error('Expected 3 items in Fn::FindInMap array');
        }

        // Resolve each parameter from the intrinsic array:
        // 1. Map name,
        // 2. Top-level key, and
        // 3. Second-level key.
        const mapName = resolveValue(value[CfIntrinsicFunctions.Fn_FindInMap][0], ctx);
        const level1Key = resolveValue(value[CfIntrinsicFunctions.Fn_FindInMap][1], ctx);
        const level2Key = resolveValue(value[CfIntrinsicFunctions.Fn_FindInMap][2], ctx);

        // Validate that the resolved values are strings.
        if (typeof mapName !== 'string') {
            log.warn('fnFindInMap: MapName is not a string', mapName);
            throw new Error('Expected map name to be a string');
        }
        if (typeof level1Key !== 'string') {
            log.warn('fnFindInMap: Level1Key is not a string', level1Key);
            throw new Error('Expected top-level key to be a string');
        }
        if (typeof level2Key !== 'string') {
            log.warn('fnFindInMap: Level2Key is not a string', level2Key);
            throw new Error('Expected second-level key to be a string');
        }

        // Ensure that the original template contains the Mappings section.
        if (!ctx.originalTemplate.Mappings) {
            log.warn('fnFindInMap: Template Mappings are missing');
            throw new Error('Template Mappings are missing. Fn::FindInMap cannot search for a value');
        }

        // Retrieve the specified mapping from the original template.
        const mapping = ctx.originalTemplate.Mappings;
        const map = mapping[mapName];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!map) {
            log.warn(`fnFindInMap: Mapping "${mapName}" not found in template Mappings`);
            throw new Error(`Mapping with name "${mapName}" not found`);
        }

        // Retrieve the top-level mapping section for the given key.
        const level1Map = map[level1Key];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!level1Map) {
            log.warn(`fnFindInMap: Mapping for key "${level1Key}" not found in mapping "${mapName}"`);
            throw new Error(`Mapping for key "${level1Key}" not found in mapping "${mapName}"`);
        }

        // Retrieve the final value using the second-level key.
        const mapValue = level1Map[level2Key];
        if (mapValue === undefined || mapValue === null) {
            log.warn(`fnFindInMap: Value for key "${level2Key}" not found in mapping "${mapName}" at top-level key "${level1Key}"`);
            throw new Error(`Value for key "${level2Key}" not found in mapping "${mapName}" at top-level key "${level1Key}"`);
        }

        log.trace(`fnFindInMap: Found value for map "${mapName}", level1 "${level1Key}", level2 "${level2Key}"`);
        return mapValue;
    }
}
