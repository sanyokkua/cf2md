import log from 'loglevel';
import { awsApiGatewayResourceFunc } from '../../../../../src/cloudformation/parsing/resolver/resources/awsApiGatewayResourceFunc';
import { ResolvingContext } from '../../../../../src/cloudformation/parsing/types/types';
import { generateAlphaNumeric, resolveString } from '../../../../../src/cloudformation/parsing/utils/helper-utils';
import { CloudFormationResource } from '../../../../../src/cloudformation/types/cloudformation-model';

jest.mock('../../../../../src/cloudformation/parsing/utils/helper-utils', () => ({
    generateAlphaNumeric: jest.fn(() => 'MOCKED_ID'),
    resolveString: jest.fn((_value, _prop, _ctx) => 'resolvedRestApiId'),
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

describe('awsApiGatewayResourceFunc', () => {
    let mockCtx: ResolvingContext;
    let resource: CloudFormationResource;

    beforeEach(() => {
        mockCtx = createMockContext();
        resource = {
            Properties: {
                RestApiId: 'dummyRestApiId',
            },
        } as CloudFormationResource;
        delete resource._id;
        delete resource._arn;
        jest.clearAllMocks();
    });

    describe('idGenFunc', () => {
        it('should generate 16-character ID when none exists', () => {
            const id = awsApiGatewayResourceFunc.idGenFunc(
                'AWS::ApiGateway::Resource',
                'TestResource',
                resource,
                mockCtx,
            );

            expect(id).toBe('MOCKED_ID');
            expect(resource._id).toBe('MOCKED_ID');
            expect(generateAlphaNumeric).toHaveBeenCalledWith(16, mockCtx);
        });

        it('should return existing ID when present', () => {
            resource._id = 'predefined-resource-id';
            const id = awsApiGatewayResourceFunc.idGenFunc(
                'AWS::ApiGateway::Resource',
                'TestResource',
                resource,
                mockCtx,
            );

            expect(id).toBe('predefined-resource-id');
            expect(generateAlphaNumeric).not.toHaveBeenCalled();
        });
    });

    describe('refFunc', () => {
        it('should return generated resource ID', () => {
            const id = awsApiGatewayResourceFunc.refFunc(
                'AWS::ApiGateway::Resource',
                'TestResource',
                resource,
                mockCtx,
            );

            expect(id).toBe('MOCKED_ID');
        });
    });

    describe('getAttFunc', () => {
        it('should return ID for valid ResourceId attribute', () => {
            const id = awsApiGatewayResourceFunc.getAttFunc(
                'AWS::ApiGateway::Resource',
                'ResourceId',
                'TestResource',
                resource,
                mockCtx,
            );

            expect(id).toBe('MOCKED_ID');
        });

        it('should warn and return ID for invalid attributes', () => {
            const warnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});
            const id = awsApiGatewayResourceFunc.getAttFunc(
                'AWS::ApiGateway::Resource',
                'InvalidKey',
                'TestResource',
                resource,
                mockCtx,
            );

            expect(id).toBe('MOCKED_ID');
            expect(warnSpy).toHaveBeenCalledWith(
                'Passed key InvalidKey for AWS::ApiGateway::Resource, with logicalId=TestResource is not supported, id will be returned',
                resource,
                mockCtx,
            );
            warnSpy.mockRestore();
        });
    });

    describe('arnGenFunc', () => {
        it('should construct ARN with proper resource path', () => {
            const arn = awsApiGatewayResourceFunc.arnGenFunc(
                'AWS::ApiGateway::Resource',
                'TestResource',
                resource,
                mockCtx,
            );

            expect(arn).toBe('arn:aws:apigateway:us-east-1::/restapis/resolvedRestApiId/resources/MOCKED_ID');
            expect(resolveString).toHaveBeenCalledWith(
                'dummyRestApiId',
                'AWS::ApiGateway::Resource.Properties.RestApiId',
                mockCtx,
            );
        });

        it('should use pre-existing ARN if available', () => {
            resource._arn = 'arn:aws:apigateway:eu-west-1::/restapis/api123/resources/existing';
            const arn = awsApiGatewayResourceFunc.arnGenFunc(
                'AWS::ApiGateway::Resource',
                'TestResource',
                resource,
                mockCtx,
            );

            expect(arn).toBe('arn:aws:apigateway:eu-west-1::/restapis/api123/resources/existing');
        });

        it('should reflect different regions/partitions in ARN', () => {
            (mockCtx.getRegion as jest.Mock).mockReturnValueOnce('cn-north-1');
            (mockCtx.getPartition as jest.Mock).mockReturnValueOnce('aws-cn');

            const arn = awsApiGatewayResourceFunc.arnGenFunc(
                'AWS::ApiGateway::Resource',
                'TestResource',
                resource,
                mockCtx,
            );

            expect(arn).toMatch(/arn:aws-cn:apigateway:cn-north-1/);
            expect(arn).toContain('/resources/MOCKED_ID');
        });
    });
});
