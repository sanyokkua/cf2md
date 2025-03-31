import { CloudFormationResource } from '../../../../src/parsing/types/cloudformation-model';
import { IntrinsicContext } from '../../../../src/parsing/types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../../../src/parsing/types/resolving-types';
import { ResourceUtils } from '../../../../src/parsing/types/util-service-types';

export function createMockIntrinsicContext(
    resource: Partial<CloudFormationResource> = {},
    logicalId: string = 'testResource',
    ctx: Partial<ResolvingContext> = {},
    valueResolver: ValueResolverFunc = jest.fn(),
): jest.Mocked<IntrinsicContext> {
    return {
        resource: { Properties: {}, ...resource } as CloudFormationResource,
        logicalId,
        ctx: {
            getRegion: jest.fn().mockReturnValue('us-east-1'),
            getPartition: jest.fn().mockReturnValue('aws'),
            getAccountId: jest.fn().mockReturnValue('123456789012'),
            getAZs: jest.fn().mockReturnValue('az'),
            ...ctx,
        } as ResolvingContext,
        valueResolver,
    } as unknown as jest.Mocked<IntrinsicContext>;
}

// Helper function to create a partial mock ResourceUtils
export function createMockResourceUtils(generateAlphaNumericReturnValue?: string): jest.Mocked<ResourceUtils> {
    const alphaGen = generateAlphaNumericReturnValue ?? 'abcdef';
    return {
        generateAZs: jest.fn(),
        generateAlphaNumeric: jest.fn().mockReturnValue(alphaGen),
        shortUuid: jest.fn().mockReturnValue('short-uid'),
        fullUuid: jest.fn().mockReturnValue('full-uid-number'),
        generateGenericId: jest.fn().mockReturnValue('generic-id'),
        generatePrefixedId: jest.fn().mockImplementation((val) => `${String(val)}-${alphaGen}`),
        generateNameId: jest.fn().mockImplementation((val: string | undefined, _val2, valDef: string) => val ?? valDef),
        resolveString: jest.fn().mockImplementation((val) => String(val)),
        resolveStringWithDefault: jest.fn().mockImplementation((val: string | undefined, def: string) => val ?? def),
    } as unknown as jest.Mocked<ResourceUtils>;
}
