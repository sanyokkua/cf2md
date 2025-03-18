import log from 'loglevel';
import { awsApiGatewayRequestValidatorFunc } from '../../../../../src/cloudformation/parsing/resolver/resources/awsApiGatewayRequestValidatorFunc';
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

describe('awsApiGatewayRequestValidatorFunc', () => {
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
        it('should generate 10-character ID when none exists', () => {
            const id = awsApiGatewayRequestValidatorFunc.idGenFunc(
                'AWS::ApiGateway::RequestValidator',
                'TestValidator',
                resource,
                mockCtx,
            );

            expect(id).toBe('MOCKED_ID');
            expect(resource._id).toBe('MOCKED_ID');
            expect(generateAlphaNumeric).toHaveBeenCalledWith(10, mockCtx);
        });

        it('should return pre-existing ID', () => {
            resource._id = 'predefined-id';
            const id = awsApiGatewayRequestValidatorFunc.idGenFunc(
                'AWS::ApiGateway::RequestValidator',
                'TestValidator',
                resource,
                mockCtx,
            );

            expect(id).toBe('predefined-id');
            expect(generateAlphaNumeric).not.toHaveBeenCalled();
        });
    });

    describe('refFunc', () => {
        it('should return generated validator ID', () => {
            const id = awsApiGatewayRequestValidatorFunc.refFunc(
                'AWS::ApiGateway::RequestValidator',
                'TestValidator',
                resource,
                mockCtx,
            );

            expect(id).toBe('MOCKED_ID');
        });
    });

    describe('getAttFunc', () => {
        it('should return ID for valid RequestValidatorId attribute', () => {
            const id = awsApiGatewayRequestValidatorFunc.getAttFunc(
                'AWS::ApiGateway::RequestValidator',
                'RequestValidatorId',
                'TestValidator',
                resource,
                mockCtx,
            );

            expect(id).toBe('MOCKED_ID');
        });

        it('should warn and return ID for invalid attributes', () => {
            const warnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});
            const id = awsApiGatewayRequestValidatorFunc.getAttFunc(
                'AWS::ApiGateway::RequestValidator',
                'InvalidAttribute',
                'TestValidator',
                resource,
                mockCtx,
            );

            expect(id).toBe('MOCKED_ID');
            expect(warnSpy).toHaveBeenCalledWith(
                'Passed key InvalidAttribute for AWS::ApiGateway::RequestValidator, with logicalId=TestValidator is not supported, id will be returned',
                resource,
                mockCtx,
            );
            warnSpy.mockRestore();
        });
    });

    describe('arnGenFunc', () => {
        it('should construct ARN with region/partition/restapi components', () => {
            const arn = awsApiGatewayRequestValidatorFunc.arnGenFunc(
                'AWS::ApiGateway::RequestValidator',
                'TestValidator',
                resource,
                mockCtx,
            );

            expect(arn).toBe('arn:aws:apigateway:us-east-1::/restapis/resolvedRestApiId/requestvalidators/MOCKED_ID');
            expect(resolveString).toHaveBeenCalledWith(
                'dummyRestApiId',
                'AWS::ApiGateway::RequestValidator.Properties.RestApiId',
                mockCtx,
            );
        });

        it('should use cached ARN if present', () => {
            resource._arn = 'arn:aws:apigateway:us-west-2::/restapis/api123/requestvalidators/existing';
            const arn = awsApiGatewayRequestValidatorFunc.arnGenFunc(
                'AWS::ApiGateway::RequestValidator',
                'TestValidator',
                resource,
                mockCtx,
            );

            expect(arn).toBe('arn:aws:apigateway:us-west-2::/restapis/api123/requestvalidators/existing');
        });

        it('should validate region/partition placement', () => {
            (mockCtx.getRegion as jest.Mock).mockReturnValueOnce('eu-west-1');
            (mockCtx.getPartition as jest.Mock).mockReturnValueOnce('aws-eu');

            const arn = awsApiGatewayRequestValidatorFunc.arnGenFunc(
                'AWS::ApiGateway::RequestValidator',
                'TestValidator',
                resource,
                mockCtx,
            );

            expect(arn).toMatch(/arn:aws-eu:apigateway:eu-west-1/);
        });
    });
});
