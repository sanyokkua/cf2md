import { removePrefixIfPresent } from 'coreutilsts';
import log from 'loglevel';
import { stubFunctionForUnsupportedResources } from '../../../../../src/cloudformation/parsing/resolver/resources/stubFunctionForUnsupportedResources';
import { ResolvingContext } from '../../../../../src/cloudformation/parsing/types/types';
import { generateAlphaNumeric } from '../../../../../src/cloudformation/parsing/utils/helper-utils';
import { CloudFormationResource } from '../../../../../src/cloudformation/types/cloudformation-model';

// Mock helper functions
jest.mock('../../../../../src/cloudformation/parsing/utils/helper-utils', () => ({
    generateAlphaNumeric: jest.fn(() => 'MOCKED_ID'),
}));

jest.mock('coreutilsts', () => ({
    removePrefixIfPresent: jest.fn((_str: string, _prefix: string) => 'mock-service'),
}));

// Mock context creation helper
function createMockContext(): ResolvingContext {
    return {
        originalTemplate: {},
        lookupMapPreProcessed: {},
        generatedIds: new Set(),
        lookupMapDynamic: {},
        currentPath: [],
        addName: jest.fn(),
        popName: jest.fn(() => ''),
        getCurrentPath: jest.fn(() => ''),
        hasParameterName: jest.fn(() => false),
        getParameter: jest.fn(),
        addParameter: jest.fn(),
        addGeneratedId: jest.fn(),
        isIdExists: jest.fn(() => false),
        getRegion: jest.fn(() => 'us-east-1'),
        getPartition: jest.fn(() => 'aws'),
        getAccountId: jest.fn(() => '123456789012'),
        getAZs: jest.fn(() => ['us-east-1a', 'us-east-1b']),
    } as unknown as ResolvingContext;
}

describe('stubFunctionForUnsupportedResources', () => {
    let mockCtx: ResolvingContext;
    let resource: CloudFormationResource;
    const resourceType = 'AWS::Some::UnsupportedResource';
    const logicalId = 'TestResource';

    beforeEach(() => {
        mockCtx = createMockContext();
        resource = {} as CloudFormationResource;
        delete resource._id;
        delete resource._arn;
        (generateAlphaNumeric as jest.Mock).mockClear();
        (removePrefixIfPresent as jest.Mock).mockClear();
    });

    describe('idGenFunc', () => {
        it('should generate a new ID using generateAlphaNumeric', () => {
            const id = stubFunctionForUnsupportedResources.idGenFunc(resourceType, logicalId, resource, mockCtx);

            expect(id).toBe('MOCKED_ID');
            expect(resource._id).toBe('MOCKED_ID');
            expect(generateAlphaNumeric).toHaveBeenCalledWith(6, mockCtx);
        });

        it('should return existing ID when present', () => {
            resource._id = 'existing-id';
            const id = stubFunctionForUnsupportedResources.idGenFunc(resourceType, logicalId, resource, mockCtx);

            expect(id).toBe('existing-id');
            expect(generateAlphaNumeric).not.toHaveBeenCalled();
        });
    });

    describe('refFunc', () => {
        it('should return the logical ID directly', () => {
            const ref = stubFunctionForUnsupportedResources.refFunc(resourceType, logicalId, resource, mockCtx);

            expect(ref).toBe(logicalId);
        });
    });

    describe('getAttFunc', () => {
        it('should warn and return generated ID for any attribute key', () => {
            const warnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});
            const result = stubFunctionForUnsupportedResources.getAttFunc(
                resourceType,
                'AnyKey',
                logicalId,
                resource,
                mockCtx,
            );

            expect(warnSpy).toHaveBeenCalledWith(
                `Passed key AnyKey for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
                resource,
                mockCtx,
            );
            expect(result).toBe('MOCKED_ID');
            warnSpy.mockRestore();
        });
    });

    describe('arnGenFunc', () => {
        it('should generate ARN with context values and service name', () => {
            const arn = stubFunctionForUnsupportedResources.arnGenFunc(resourceType, logicalId, resource, mockCtx);

            expect(removePrefixIfPresent).toHaveBeenCalledWith(resourceType, 'AWS::');
            expect(mockCtx.getPartition).toHaveBeenCalled();
            expect(mockCtx.getRegion).toHaveBeenCalled();
            expect(mockCtx.getAccountId).toHaveBeenCalled();
            expect(arn).toBe('arn:aws:mock-service:us-east-1:123456789012:MOCKED_ID');
        });

        it('should use existing ARN when present', () => {
            resource._arn = 'existing-arn';
            const arn = stubFunctionForUnsupportedResources.arnGenFunc(resourceType, logicalId, resource, mockCtx);

            expect(arn).toBe('existing-arn');
        });

        it('should use generated ID from idGenFunc', () => {
            stubFunctionForUnsupportedResources.arnGenFunc(resourceType, logicalId, resource, mockCtx);

            expect(generateAlphaNumeric).toHaveBeenCalled();
            expect(resource._id).toBe('MOCKED_ID');
        });
    });

    describe('edge cases', () => {
        it('should handle resource types without AWS:: prefix', () => {
            (removePrefixIfPresent as jest.Mock).mockImplementation((s: string) => s);

            stubFunctionForUnsupportedResources.arnGenFunc('Custom::Resource', logicalId, resource, mockCtx);

            expect(removePrefixIfPresent).toHaveBeenCalledWith('Custom::Resource', 'AWS::');
            expect(resource._arn).toContain('Custom::Resource');
        });

        it('should handle empty resource properties', () => {
            (removePrefixIfPresent as jest.Mock).mockReturnValueOnce('mock-service');
            const arn = stubFunctionForUnsupportedResources.arnGenFunc(
                resourceType,
                logicalId,
                {} as CloudFormationResource,
                mockCtx,
            );

            expect(arn).toBe('arn:aws:mock-service:us-east-1:123456789012:MOCKED_ID');
        });
    });
});
