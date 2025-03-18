import { removePrefixIfPresent } from 'coreutilsts';
import log from 'loglevel';
import { awsPipesPipeFunc } from '../../../../../src/cloudformation/parsing/resolver/resources/awsPipesPipeFunc';
import { ResolvingContext } from '../../../../../src/cloudformation/parsing/types/types';
import {
    generateAlphaNumeric,
    resolveStringWithDefault,
} from '../../../../../src/cloudformation/parsing/utils/helper-utils';
import {
    CloudFormationResource,
    PipesPipeResource,
} from '../../../../../src/cloudformation/types/cloudformation-model';

// Mock the helper functions so we can control their outputs.
jest.mock('../../../../../src/cloudformation/parsing/utils/helper-utils', () => ({
    generateAlphaNumeric: jest.fn(() => 'MOCKED_ALPHA'),
    resolveStringWithDefault: jest.fn(
        (_prop: unknown, defaultValue: string, _propName: string, _ctx: ResolvingContext) => defaultValue,
    ),
}));

// Also, mock removePrefixIfPresent to simply remove the given prefix.
jest.mock('coreutilsts', () => ({
    removePrefixIfPresent: jest.fn((arn: string, prefix: string) => arn.replace(prefix, '')),
}));

/**
 * Creates a fresh mock ResolvingContext for testing.
 *
 * @returns A mock ResolvingContext.
 */
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

describe('awsPipesPipeFunc', () => {
    let mockCtx: ResolvingContext;
    let resource: CloudFormationResource;

    beforeEach(() => {
        // Create a fresh mock context and resource for every test.
        mockCtx = createMockContext();
        resource = {
            Properties: {
                // For awsPipesPipeFunc, the resource-specific property is "Name"
                Name: 'dummyPipeName',
            },
        } as PipesPipeResource;

        // Ensure _id and _arn are not preset.
        delete resource._id;
        delete resource._arn;

        // Clear any previous calls on helper mocks.
        (generateAlphaNumeric as jest.Mock).mockClear();
        (resolveStringWithDefault as jest.Mock).mockClear();
    });

    describe('idGenFunc', () => {
        it('should generate a new ID if not already set', () => {
            const id = awsPipesPipeFunc.idGenFunc('AWS::Pipes::Pipe', 'TestLogicalId', resource, mockCtx);
            // generateAlphaNumeric(6, ctx) returns 'MOCKED_ALPHA'
            // Thus, the default pipe name becomes "pipe-MOCKED_ALPHA"
            // And arnGenFunc will produce:
            // arn:{partition}:pipes:{region}:{accountId}:pipe/{pipeName}
            // With our mock context values:
            // partition = 'aws', region = 'us-east-1', accountId = '123456789012'
            const expectedArn = 'arn:aws:pipes:us-east-1:123456789012:pipe/pipe-MOCKED_ALPHA';
            expect(id).toBe(expectedArn);
            expect(resource._id).toBe(expectedArn);
            expect(generateAlphaNumeric).toHaveBeenCalledWith(6, mockCtx);
            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                'dummyPipeName',
                'pipe-MOCKED_ALPHA',
                'AWS::Pipes::Pipe.Properties.Name',
                mockCtx,
            );
        });

        it('should return the existing ID if already set', () => {
            resource._id = 'existingPipeId';
            const id = awsPipesPipeFunc.idGenFunc('AWS::Pipes::Pipe', 'TestLogicalId', resource, mockCtx);
            expect(id).toBe('existingPipeId');
            // When _id exists, helpers should not be called.
            expect(generateAlphaNumeric).not.toHaveBeenCalled();
            expect(resolveStringWithDefault).not.toHaveBeenCalled();
        });
    });

    describe('refFunc', () => {
        it('should return the pipe name (ID) extracted from the ARN', () => {
            // First, generate the ARN via arnGenFunc.
            // Given our mocks, arnGenFunc returns:
            // "arn:aws:pipes:us-east-1:123456789012:pipe/pipe-MOCKED_ALPHA"
            // refFunc removes the prefix:
            // prefix = "arn:aws:pipes:us-east-1:123456789012:pipe/"
            // Expected returned value: "pipe-MOCKED_ALPHA"
            const ref = awsPipesPipeFunc.refFunc('AWS::Pipes::Pipe', 'TestLogicalId', resource, mockCtx);
            expect(ref).toBe('pipe-MOCKED_ALPHA');
            // Also ensure that removePrefixIfPresent was called with the correct arguments.
            const expectedPrefix = 'arn:aws:pipes:us-east-1:123456789012:pipe/';
            expect(removePrefixIfPresent).toHaveBeenCalledWith(
                'arn:aws:pipes:us-east-1:123456789012:pipe/pipe-MOCKED_ALPHA',
                expectedPrefix,
            );
        });
    });

    describe('getAttFunc', () => {
        it('should return the ARN when key is "Arn"', () => {
            const att = awsPipesPipeFunc.getAttFunc('AWS::Pipes::Pipe', 'Arn', 'TestLogicalId', resource, mockCtx);
            const expectedArn = 'arn:aws:pipes:us-east-1:123456789012:pipe/pipe-MOCKED_ALPHA';
            expect(att).toBe(expectedArn);
        });

        it('should return runtime values for supported keys', () => {
            const keysAndExpected = {
                CreationTime: 'RUNTIME_CreationTime',
                CurrentState: 'RUNTIME_CurrentState',
                LastModifiedTime: 'RUNTIME_LastModifiedTime',
                StateReason: 'RUNTIME_StateReason',
            };
            for (const [key, expected] of Object.entries(keysAndExpected)) {
                const att = awsPipesPipeFunc.getAttFunc('AWS::Pipes::Pipe', key, 'TestLogicalId', resource, mockCtx);
                expect(att).toBe(expected);
            }
        });

        it('should warn and return the ID when an unsupported key is passed', () => {
            const warnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});
            const att = awsPipesPipeFunc.getAttFunc(
                'AWS::Pipes::Pipe',
                'UnsupportedKey',
                'TestLogicalId',
                resource,
                mockCtx,
            );
            // For unsupported keys, it falls back to idGenFunc, which returns the ARN.
            const expectedId = 'arn:aws:pipes:us-east-1:123456789012:pipe/pipe-MOCKED_ALPHA';
            expect(att).toBe(expectedId);
            expect(warnSpy).toHaveBeenCalledWith(
                `Passed key UnsupportedKey for AWS::Pipes::Pipe, with logicalId=TestLogicalId is not supported, id will be returned`,
                resource,
                mockCtx,
            );
            warnSpy.mockRestore();
        });
    });

    describe('arnGenFunc', () => {
        it('should generate and assign a new ARN if none exists', () => {
            const arn = awsPipesPipeFunc.arnGenFunc('AWS::Pipes::Pipe', 'TestLogicalId', resource, mockCtx);
            const expectedArn = 'arn:aws:pipes:us-east-1:123456789012:pipe/pipe-MOCKED_ALPHA';
            expect(arn).toBe(expectedArn);
            expect(resource._arn).toBe(expectedArn);
            // Verify helper calls.
            expect(generateAlphaNumeric).toHaveBeenCalledWith(6, mockCtx);
            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                'dummyPipeName',
                'pipe-MOCKED_ALPHA',
                'AWS::Pipes::Pipe.Properties.Name',
                mockCtx,
            );
        });

        it('should return the existing ARN if it is already set', () => {
            resource._arn = 'existingArn';
            const arn = awsPipesPipeFunc.arnGenFunc('AWS::Pipes::Pipe', 'TestLogicalId', resource, mockCtx);
            expect(arn).toBe('existingArn');
        });
    });
});
