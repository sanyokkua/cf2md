import log from 'loglevel';
import { awsApiGatewayModelFunc } from '../../../../../src/cloudformation/parsing/resolver/resources/awsApiGatewayModelFunc';
import { ResolvingContext } from '../../../../../src/cloudformation/parsing/types/types';
import {
    generateAlphaNumeric,
    resolveString,
    resolveStringWithDefault,
} from '../../../../../src/cloudformation/parsing/utils/helper-utils';
import { CloudFormationResource } from '../../../../../src/cloudformation/types/cloudformation-model';

jest.mock('../../../../../src/cloudformation/parsing/utils/helper-utils', () => ({
    generateAlphaNumeric: jest.fn(() => 'MOCKED_ID'),
    resolveString: jest.fn((_value, _prop, _ctx) => 'resolvedRestApiId'),
    resolveStringWithDefault: jest.fn((_val, def, _prop, _ctx) => def),
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

describe('awsApiGatewayModelFunc', () => {
    let mockCtx: ResolvingContext;
    let resource: CloudFormationResource;

    beforeEach(() => {
        mockCtx = createMockContext();
        resource = {
            Properties: {
                RestApiId: 'dummyRestApiId',
                Name: 'TestModel',
            },
        } as CloudFormationResource;
        delete resource._id;
        delete resource._arn;
        jest.clearAllMocks();
    });

    describe('idGenFunc', () => {
        it('should use Name property when available', () => {
            (resolveStringWithDefault as jest.Mock).mockImplementationOnce(() => 'TestModel');
            const id = awsApiGatewayModelFunc.idGenFunc('AWS::ApiGateway::Model', 'TestModel', resource, mockCtx);

            expect(id).toBe('TestModel');
            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                'TestModel',
                expect.stringContaining('Model-'),
                'AWS::ApiGateway::Model.Properties.Name',
                mockCtx,
            );
        });

        it('should generate default ID when Name is missing', () => {
            delete resource.Properties?.Name;
            const id = awsApiGatewayModelFunc.idGenFunc('AWS::ApiGateway::Model', 'TestModel', resource, mockCtx);

            expect(id).toMatch(/Model-MOCKED_ID/);
            expect(generateAlphaNumeric).toHaveBeenCalledWith(5, mockCtx);
        });

        it('should return existing ID when set', () => {
            resource._id = 'predefined-id';
            const id = awsApiGatewayModelFunc.idGenFunc('AWS::ApiGateway::Model', 'TestModel', resource, mockCtx);

            expect(id).toBe('predefined-id');
            expect(resolveStringWithDefault).not.toHaveBeenCalled();
        });
    });

    describe('refFunc', () => {
        it('should return generated ID', () => {
            const id = awsApiGatewayModelFunc.refFunc('AWS::ApiGateway::Model', 'TestModel', resource, mockCtx);

            expect(id).toMatch(/Model-MOCKED_ID/);
        });
    });

    describe('getAttFunc', () => {
        it('should warn and return ID for any attribute key', () => {
            const warnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});
            const id = awsApiGatewayModelFunc.getAttFunc(
                'AWS::ApiGateway::Model',
                'AnyKey',
                'TestModel',
                resource,
                mockCtx,
            );

            expect(id).toMatch(/Model-MOCKED_ID/);
            expect(warnSpy).toHaveBeenCalledWith(
                'Passed key AnyKey for AWS::ApiGateway::Model, with logicalId=TestModel is not supported, id will be returned',
                resource,
                mockCtx,
            );
            warnSpy.mockRestore();
        });
    });

    describe('arnGenFunc', () => {
        it('should construct correct ARN format', () => {
            const arn = awsApiGatewayModelFunc.arnGenFunc('AWS::ApiGateway::Model', 'TestModel', resource, mockCtx);

            expect(arn).toBe('arn:aws:apigateway:us-east-1::/restapis/resolvedRestApiId/models/Model-MOCKED_ID');
            expect(resolveString).toHaveBeenCalledWith(
                'dummyRestApiId',
                'AWS::ApiGateway::Model.Properties.RestApiId',
                mockCtx,
            );
        });

        it('should use existing ARN if present', () => {
            resource._arn = 'arn:aws:apigateway:us-east-1::/restapis/api123/models/existing';
            const arn = awsApiGatewayModelFunc.arnGenFunc('AWS::ApiGateway::Model', 'TestModel', resource, mockCtx);

            expect(arn).toBe('arn:aws:apigateway:us-east-1::/restapis/api123/models/existing');
        });
    });
});
