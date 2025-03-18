import log from 'loglevel';
import { awsEventsConnectionFunc } from '../../../../../src/cloudformation/parsing/resolver/resources/awsEventsConnectionFunc';
import { ResolvingContext } from '../../../../../src/cloudformation/parsing/types/types';
import {
    generateAlphaNumeric,
    resolveStringWithDefault,
} from '../../../../../src/cloudformation/parsing/utils/helper-utils';
import { EventsConnectionResource } from '../../../../../src/cloudformation/types/cloudformation-model';

// Mock helper utilities
jest.mock('../../../../../src/cloudformation/parsing/utils/helper-utils', () => ({
    generateAlphaNumeric: jest.fn((_length: number, _ctx: ResolvingContext) => 'MOCKED_ID'),
    resolveStringWithDefault: jest.fn(
        (_prop: unknown, _defaultVal: string, _propName: string, _ctx: ResolvingContext) => 'resolved-connection-name',
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

describe('awsEventsConnectionFunc', () => {
    let mockCtx: ResolvingContext;
    let resource: EventsConnectionResource;

    beforeEach(() => {
        mockCtx = createMockContext();
        resource = {
            Properties: {
                Name: 'my-connection',
                AuthParameters: {
                    ConnectivityParameters: {
                        ResourceParameters: {
                            ResourceAssociationArn: 'original-association-arn',
                        },
                    },
                },
                InvocationConnectivityParameters: {
                    ResourceParameters: {
                        ResourceAssociationArn: 'original-invocation-arn',
                    },
                },
                SecretArn: 'original-secret-arn',
            },
        } as unknown as EventsConnectionResource;
        delete resource._id;
        delete resource._arn;

        (generateAlphaNumeric as jest.Mock).mockClear();
        (resolveStringWithDefault as jest.Mock).mockClear();
    });

    describe('idGenFunc', () => {
        it('should generate ID from Name property when not set', () => {
            const id = awsEventsConnectionFunc.idGenFunc(
                'AWS::Events::Connection',
                'TestConnection',
                resource,
                mockCtx,
            );

            expect(id).toBe('resolved-connection-name');
            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                'my-connection',
                'connection-MOCKED_ID',
                'AWS::Events::Connection.Properties.Name',
                mockCtx,
            );
            expect(resource._id).toBe(id);
        });

        it('should use generated name when Name is missing', () => {
            delete resource.Properties?.Name;

            const id = awsEventsConnectionFunc.idGenFunc(
                'AWS::Events::Connection',
                'TestConnection',
                resource,
                mockCtx,
            );

            expect(id).toBe('resolved-connection-name');
            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                undefined,
                'connection-MOCKED_ID',
                'AWS::Events::Connection.Properties.Name',
                mockCtx,
            );
        });

        it('should return existing ID when present', () => {
            resource._id = 'existing-connection-id';
            const id = awsEventsConnectionFunc.idGenFunc(
                'AWS::Events::Connection',
                'TestConnection',
                resource,
                mockCtx,
            );

            expect(id).toBe('existing-connection-id');
            expect(resolveStringWithDefault).not.toHaveBeenCalled();
        });
    });

    describe('refFunc', () => {
        it('should return generated ID from idGenFunc', () => {
            const result = awsEventsConnectionFunc.refFunc(
                'AWS::Events::Connection',
                'TestConnection',
                resource,
                mockCtx,
            );

            expect(result).toBe('resolved-connection-name');
        });
    });

    describe('getAttFunc', () => {
        it('should return ARN for valid "Arn" attribute', () => {
            const arn = awsEventsConnectionFunc.arnGenFunc(
                'AWS::Events::Connection',
                'TestConnection',
                resource,
                mockCtx,
            );

            const result = awsEventsConnectionFunc.getAttFunc(
                'AWS::Events::Connection',
                'Arn',
                'TestConnection',
                resource,
                mockCtx,
            );

            expect(result).toBe(arn);
        });

        it('should resolve nested AuthParameters attribute', () => {
            const result = awsEventsConnectionFunc.getAttFunc(
                'AWS::Events::Connection',
                'AuthParameters.ConnectivityParameters.ResourceParameters.ResourceAssociationArn',
                'TestConnection',
                resource,
                mockCtx,
            );

            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                'original-association-arn',
                'ResourceAssociationArn',
                'AWS::Events::Connection.Properties.AuthParameters?.ConnectivityParameters?.ResourceParameters.ResourceAssociationArn',
                mockCtx,
            );
            expect(result).toBe('resolved-connection-name');
        });

        it('should resolve nested InvocationConnectivityParameters attribute', () => {
            const result = awsEventsConnectionFunc.getAttFunc(
                'AWS::Events::Connection',
                'InvocationConnectivityParameters.ResourceParameters.ResourceAssociationArn',
                'TestConnection',
                resource,
                mockCtx,
            );

            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                'original-invocation-arn',
                'ResourceAssociationArn',
                'AWS::Events::Connection.Properties.InvocationConnectivityParameters?.ResourceParameters.ResourceAssociationArn',
                mockCtx,
            );
            expect(result).toBe('resolved-connection-name');
        });

        it('should resolve SecretArn attribute', () => {
            const result = awsEventsConnectionFunc.getAttFunc(
                'AWS::Events::Connection',
                'SecretArn',
                'TestConnection',
                resource,
                mockCtx,
            );

            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                'original-secret-arn',
                'SecretsArn',
                'AWS::Events::Connection.Properties.SecretArn',
                mockCtx,
            );
            expect(result).toBe('resolved-connection-name');
        });

        it('should warn and return ID for unsupported attributes', () => {
            const warnSpy = jest.spyOn(log, 'warn').mockImplementation();

            const result = awsEventsConnectionFunc.getAttFunc(
                'AWS::Events::Connection',
                'InvalidAttribute',
                'TestConnection',
                resource,
                mockCtx,
            );

            expect(warnSpy).toHaveBeenCalledWith(
                'Passed key InvalidAttribute for AWS::Events::Connection, with logicalId=TestConnection is not supported, id will be returned',
                resource,
                mockCtx,
            );
            expect(result).toBe('resolved-connection-name');
            warnSpy.mockRestore();
        });
    });

    describe('arnGenFunc', () => {
        it('should generate ARN with correct components', () => {
            const arn = awsEventsConnectionFunc.arnGenFunc(
                'AWS::Events::Connection',
                'TestConnection',
                resource,
                mockCtx,
            );

            expect(arn).toBe('arn:aws:events:us-east-1:123456789012:connection/resolved-connection-name');
            expect(mockCtx.getRegion).toHaveBeenCalled();
            expect(mockCtx.getPartition).toHaveBeenCalled();
            expect(mockCtx.getAccountId).toHaveBeenCalled();
        });

        it('should use existing ARN when present', () => {
            resource._arn = 'existing-arn';
            const arn = awsEventsConnectionFunc.arnGenFunc(
                'AWS::Events::Connection',
                'TestConnection',
                resource,
                mockCtx,
            );

            expect(arn).toBe('existing-arn');
            expect(mockCtx.getRegion).not.toHaveBeenCalled();
        });

        it('should handle different AWS partitions', () => {
            (mockCtx.getPartition as jest.Mock).mockReturnValue('aws-cn');
            (mockCtx.getRegion as jest.Mock).mockReturnValue('cn-north-1');

            const arn = awsEventsConnectionFunc.arnGenFunc(
                'AWS::Events::Connection',
                'TestConnection',
                resource,
                mockCtx,
            );

            expect(arn).toBe('arn:aws-cn:events:cn-north-1:123456789012:connection/resolved-connection-name');
        });

        it('should use generated ID for ARN construction', () => {
            const idSpy = jest.spyOn(awsEventsConnectionFunc, 'idGenFunc');

            awsEventsConnectionFunc.arnGenFunc('AWS::Events::Connection', 'TestConnection', resource, mockCtx);

            expect(idSpy).toHaveBeenCalled();
        });
    });
});
