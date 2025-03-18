import log from 'loglevel';
import { awsEcsServiceFunc } from '../../../../../src/cloudformation/parsing/resolver/resources/awsEcsServiceFunc';
import { ResolvingContext } from '../../../../../src/cloudformation/parsing/types/types';
import { resolveStringWithDefault } from '../../../../../src/cloudformation/parsing/utils/helper-utils';
import {
    CloudFormationResource,
    EcsServiceResource,
} from '../../../../../src/cloudformation/types/cloudformation-model';

// Mock the helper function so we can control its output.
jest.mock('../../../../../src/cloudformation/parsing/utils/helper-utils', () => ({
    resolveStringWithDefault: jest.fn(() => 'RESOLVED_SERVICE'),
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
        getRegion: jest.fn(() => 'us-east-2'),
        getPartition: jest.fn(() => 'aws'),
        getAccountId: jest.fn(() => '987654321098'),
        getAZs: jest.fn(() => ['us-east-2a', 'us-east-2b']),
    } as unknown as ResolvingContext;
}

describe('awsEcsServiceFunc', () => {
    let mockCtx: ResolvingContext;
    let resource: CloudFormationResource;

    beforeEach(() => {
        // Create a fresh context and resource for every test.
        mockCtx = createMockContext();
        resource = {
            Properties: {
                Cluster: 'MyCluster',
                ServiceName: 'MyService',
            },
        } as EcsServiceResource;

        // Ensure _id and _arn are not preset.
        delete resource._id;
        delete resource._arn;

        // Clear previous calls on the helper mock.
        (resolveStringWithDefault as jest.Mock).mockClear();
    });

    describe('idGenFunc', () => {
        it('should generate a new ID if not already set', () => {
            const id = awsEcsServiceFunc.idGenFunc('AWS::ECS::Service', 'TestLogicalId', resource, mockCtx);

            // The helper is called with:
            // - property: resource.Properties.ServiceName ('MyService')
            // - default value: logicalId ('TestLogicalId')
            // - propertyName: 'AWS::ECS::Service.Properties.ServiceName'
            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                'MyService',
                'TestLogicalId',
                'AWS::ECS::Service.Properties.ServiceName',
                mockCtx,
            );
            expect(id).toBe('RESOLVED_SERVICE');
            expect(resource._id).toBe('RESOLVED_SERVICE');
        });

        it('should return the existing ID if already set', () => {
            resource._id = 'existingServiceId';
            const id = awsEcsServiceFunc.idGenFunc('AWS::ECS::Service', 'TestLogicalId', resource, mockCtx);
            expect(id).toBe('existingServiceId');
            expect(resolveStringWithDefault).not.toHaveBeenCalled();
        });
    });

    describe('refFunc', () => {
        it('should return the ARN generated by arnGenFunc', () => {
            // refFunc calls arnGenFunc internally.
            const arn = awsEcsServiceFunc.refFunc('AWS::ECS::Service', 'TestLogicalId', resource, mockCtx);
            // idGenFunc returns 'RESOLVED_SERVICE'
            // arnGenFunc constructs the ARN as:
            // arn:{partition}:ecs:{region}:{accountId}:service/{cluster}/{serviceName}
            const expectedArn = `arn:aws:ecs:us-east-2:987654321098:service/RESOLVED_SERVICE/RESOLVED_SERVICE`;
            expect(arn).toBe(expectedArn);
        });
    });

    describe('getAttFunc', () => {
        it('should return the ID when key is "Name"', () => {
            const id = awsEcsServiceFunc.getAttFunc('AWS::ECS::Service', 'Name', 'TestLogicalId', resource, mockCtx);
            // "Name" returns the idGenFunc result.
            expect(id).toBe('RESOLVED_SERVICE');
        });

        it('should return the ARN when key is "ServiceArn"', () => {
            const arn = awsEcsServiceFunc.getAttFunc(
                'AWS::ECS::Service',
                'ServiceArn',
                'TestLogicalId',
                resource,
                mockCtx,
            );
            const expectedArn = `arn:aws:ecs:us-east-2:987654321098:service/RESOLVED_SERVICE/RESOLVED_SERVICE`;
            expect(arn).toBe(expectedArn);
        });

        it('should warn and return the ID for unsupported attribute keys', () => {
            const warnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});
            const id = awsEcsServiceFunc.getAttFunc(
                'AWS::ECS::Service',
                'UnsupportedKey',
                'TestLogicalId',
                resource,
                mockCtx,
            );
            expect(id).toBe('RESOLVED_SERVICE');
            expect(warnSpy).toHaveBeenCalledWith(
                `Passed key UnsupportedKey for AWS::ECS::Service, with logicalId=TestLogicalId is not supported, id will be returned`,
                resource,
                mockCtx,
            );
            warnSpy.mockRestore();
        });
    });

    describe('arnGenFunc', () => {
        it('should generate and assign a new ARN if none exists', () => {
            const arn = awsEcsServiceFunc.arnGenFunc('AWS::ECS::Service', 'TestLogicalId', resource, mockCtx);

            // Verify that resolveStringWithDefault is called for Cluster property:
            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                'MyCluster',
                'default',
                'AWS::ECS::Service.Properties.Cluster',
                mockCtx,
            );
            // The ARN is constructed as:
            // arn:{partition}:ecs:{region}:{accountId}:service/{cluster}/{serviceName}
            const expectedArn = `arn:aws:ecs:us-east-2:987654321098:service/RESOLVED_SERVICE/RESOLVED_SERVICE`;
            expect(arn).toBe(expectedArn);
            expect(resource._arn).toBe(expectedArn);
        });

        it('should return the existing ARN if it is already set', () => {
            resource._arn = 'existingArn';
            const arn = awsEcsServiceFunc.arnGenFunc('AWS::ECS::Service', 'TestLogicalId', resource, mockCtx);
            expect(arn).toBe('existingArn');
        });
    });
});
