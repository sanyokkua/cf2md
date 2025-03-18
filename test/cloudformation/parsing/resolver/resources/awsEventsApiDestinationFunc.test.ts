import log from 'loglevel';
import { awsEventsApiDestinationFunc } from '../../../../../src/cloudformation/parsing/resolver/resources/awsEventsApiDestinationFunc';
import { ResolvingContext } from '../../../../../src/cloudformation/parsing/types/types';
import {
    generateAlphaNumeric,
    resolveStringWithDefault,
} from '../../../../../src/cloudformation/parsing/utils/helper-utils';
import { CloudFormationResource } from '../../../../../src/cloudformation/types/cloudformation-model';

// Mock helper utilities with TypeScript casting
jest.mock('../../../../../src/cloudformation/parsing/utils/helper-utils', () => ({
    generateAlphaNumeric: jest.fn((_length: number, _ctx: ResolvingContext) => 'MOCKED_ID'),
    resolveStringWithDefault: jest.fn(
        (_prop: unknown, _defaultVal: string, _propName: string, _ctx: ResolvingContext) =>
            'resolved-api-destination-name',
    ),
}));

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

describe('awsEventsApiDestinationFunc', () => {
    let mockCtx: ResolvingContext;
    let resource: CloudFormationResource;

    beforeEach(() => {
        mockCtx = createMockContext();
        resource = {
            Properties: {
                Name: 'original-destination-name',
            },
        } as CloudFormationResource;
        delete resource._id;
        delete resource._arn;

        (generateAlphaNumeric as jest.Mock).mockClear();
        (resolveStringWithDefault as jest.Mock).mockClear();
    });

    describe('idGenFunc', () => {
        it('should generate ID using Name property when not set', () => {
            const id = awsEventsApiDestinationFunc.idGenFunc(
                'AWS::Events::ApiDestination',
                'TestDestination',
                resource,
                mockCtx,
            );

            expect(id).toBe('resolved-api-destination-name');
            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                'original-destination-name',
                'destination-MOCKED_ID',
                'AWS::Events::ApiDestination.Properties.Name',
                mockCtx,
            );
            expect(resource._id).toBe(id);
        });

        it('should use generated name when Name property is missing', () => {
            delete resource.Properties?.Name;

            const id = awsEventsApiDestinationFunc.idGenFunc(
                'AWS::Events::ApiDestination',
                'TestDestination',
                resource,
                mockCtx,
            );

            expect(id).toBe('resolved-api-destination-name');
            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                undefined,
                'destination-MOCKED_ID',
                'AWS::Events::ApiDestination.Properties.Name',
                mockCtx,
            );
        });

        it('should return existing ID when present', () => {
            resource._id = 'existing-id';
            const id = awsEventsApiDestinationFunc.idGenFunc(
                'AWS::Events::ApiDestination',
                'TestDestination',
                resource,
                mockCtx,
            );

            expect(id).toBe('existing-id');
            expect(resolveStringWithDefault).not.toHaveBeenCalled();
        });
    });

    describe('refFunc', () => {
        it('should return generated ID from idGenFunc', () => {
            const result = awsEventsApiDestinationFunc.refFunc(
                'AWS::Events::ApiDestination',
                'TestDestination',
                resource,
                mockCtx,
            );

            expect(result).toBe('resolved-api-destination-name');
        });
    });

    describe('getAttFunc', () => {
        it('should return ARN for valid "Arn" attribute', () => {
            const arn = awsEventsApiDestinationFunc.arnGenFunc(
                'AWS::Events::ApiDestination',
                'TestDestination',
                resource,
                mockCtx,
            );

            const result = awsEventsApiDestinationFunc.getAttFunc(
                'AWS::Events::ApiDestination',
                'Arn',
                'TestDestination',
                resource,
                mockCtx,
            );

            expect(result).toBe(arn);
        });

        it('should warn and return ID for unsupported attributes', () => {
            const warnSpy = jest.spyOn(log, 'warn').mockImplementation();

            const result = awsEventsApiDestinationFunc.getAttFunc(
                'AWS::Events::ApiDestination',
                'InvalidAttribute',
                'TestDestination',
                resource,
                mockCtx,
            );

            expect(warnSpy).toHaveBeenCalledWith(
                'Passed key InvalidAttribute for AWS::Events::ApiDestination, with logicalId=TestDestination is not supported, id will be returned',
                resource,
                mockCtx,
            );
            expect(result).toBe('resolved-api-destination-name');
            warnSpy.mockRestore();
        });
    });

    describe('arnGenFunc', () => {
        it('should generate ARN with correct structure', () => {
            const arn = awsEventsApiDestinationFunc.arnGenFunc(
                'AWS::Events::ApiDestination',
                'TestDestination',
                resource,
                mockCtx,
            );

            expect(arn).toBe('arn:aws:events:us-east-1:123456789012:api-destination/resolved-api-destination-name');
            expect(mockCtx.getRegion).toHaveBeenCalled();
            expect(mockCtx.getPartition).toHaveBeenCalled();
            expect(mockCtx.getAccountId).toHaveBeenCalled();
        });

        it('should use existing ARN when present', () => {
            resource._arn = 'existing-arn';
            const arn = awsEventsApiDestinationFunc.arnGenFunc(
                'AWS::Events::ApiDestination',
                'TestDestination',
                resource,
                mockCtx,
            );

            expect(arn).toBe('existing-arn');
            expect(mockCtx.getRegion).not.toHaveBeenCalled();
        });

        it('should use generated ID for ARN construction', () => {
            const idSpy = jest.spyOn(awsEventsApiDestinationFunc, 'idGenFunc');

            const arn = awsEventsApiDestinationFunc.arnGenFunc(
                'AWS::Events::ApiDestination',
                'TestDestination',
                resource,
                mockCtx,
            );

            expect(idSpy).toHaveBeenCalled();
            expect(arn).toContain('resolved-api-destination-name');
        });
    });
});
