import log from 'loglevel';
import { awsElasticLoadBalancingV2ListenerRuleFunc } from '../../../../../src/cloudformation/parsing/resolver/resources/awsElasticLoadBalancingV2ListenerRuleFunc';
import { ResolvingContext } from '../../../../../src/cloudformation/parsing/types/types';
import { generateAlphaNumeric } from '../../../../../src/cloudformation/parsing/utils/helper-utils';
import { CloudFormationResource } from '../../../../../src/cloudformation/types/cloudformation-model';

// Mock the helper function so we control its output.
jest.mock('../../../../../src/cloudformation/parsing/utils/helper-utils', () => ({
    generateAlphaNumeric: jest.fn(() => 'MOCKED_ALPHA'),
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

describe('awsElasticLoadBalancingV2ListenerRuleFunc', () => {
    let mockCtx: ResolvingContext;
    let resource: CloudFormationResource;

    beforeEach(() => {
        // Create a fresh mock context and resource for every test.
        mockCtx = createMockContext();
        resource = {
            Properties: {
                // No resource-specific properties are needed for listener rule.
            },
        } as CloudFormationResource;

        // Ensure _id and _arn are not preset.
        delete resource._id;
        delete resource._arn;

        // Clear any previous calls on helper mocks.
        (generateAlphaNumeric as jest.Mock).mockClear();
    });

    describe('idGenFunc', () => {
        it('should generate a new ID if not already set', () => {
            const id = awsElasticLoadBalancingV2ListenerRuleFunc.idGenFunc(
                'AWS::ElasticLoadBalancingV2::ListenerRule',
                'TestLogicalId',
                resource,
                mockCtx,
            );
            // Expected ARN constructed by arnGenFunc:
            // arn:{partition}:elasticloadbalancing:{region}:{accountId}:listener-rule/stub-cluster/{id1}/{id2}/{id3}
            // With each id1, id2, id3 being 'MOCKED_ALPHA'
            const expectedArn =
                'arn:aws:elasticloadbalancing:us-east-1:123456789012:listener-rule/stub-cluster/MOCKED_ALPHA/MOCKED_ALPHA/MOCKED_ALPHA';
            expect(id).toBe(expectedArn);
            expect(resource._id).toBe(expectedArn);
            // Verify that generateAlphaNumeric was called three times with length 16.
            expect(generateAlphaNumeric).toHaveBeenCalledTimes(3);
            expect(generateAlphaNumeric).toHaveBeenNthCalledWith(1, 16, mockCtx);
            expect(generateAlphaNumeric).toHaveBeenNthCalledWith(2, 16, mockCtx);
            expect(generateAlphaNumeric).toHaveBeenNthCalledWith(3, 16, mockCtx);
        });

        it('should return the existing ID if already set', () => {
            resource._id = 'existingId';
            const id = awsElasticLoadBalancingV2ListenerRuleFunc.idGenFunc(
                'AWS::ElasticLoadBalancingV2::ListenerRule',
                'TestLogicalId',
                resource,
                mockCtx,
            );
            expect(id).toBe('existingId');
            // When an ID already exists, generateAlphaNumeric should not be called.
            expect(generateAlphaNumeric).not.toHaveBeenCalled();
        });
    });

    describe('refFunc', () => {
        it('should return the ID generated by idGenFunc', () => {
            const id = awsElasticLoadBalancingV2ListenerRuleFunc.refFunc(
                'AWS::ElasticLoadBalancingV2::ListenerRule',
                'TestLogicalId',
                resource,
                mockCtx,
            );
            const expectedArn =
                'arn:aws:elasticloadbalancing:us-east-1:123456789012:listener-rule/stub-cluster/MOCKED_ALPHA/MOCKED_ALPHA/MOCKED_ALPHA';
            expect(id).toBe(expectedArn);
        });
    });

    describe('getAttFunc', () => {
        it('should return RUNTIME_IsDefault when key is "IsDefault"', () => {
            const att = awsElasticLoadBalancingV2ListenerRuleFunc.getAttFunc(
                'AWS::ElasticLoadBalancingV2::ListenerRule',
                'IsDefault',
                'TestLogicalId',
                resource,
                mockCtx,
            );
            expect(att).toBe('RUNTIME_IsDefault');
        });

        it('should return the ARN when key is "RuleArn"', () => {
            const att = awsElasticLoadBalancingV2ListenerRuleFunc.getAttFunc(
                'AWS::ElasticLoadBalancingV2::ListenerRule',
                'RuleArn',
                'TestLogicalId',
                resource,
                mockCtx,
            );
            const expectedArn =
                'arn:aws:elasticloadbalancing:us-east-1:123456789012:listener-rule/stub-cluster/MOCKED_ALPHA/MOCKED_ALPHA/MOCKED_ALPHA';
            expect(att).toBe(expectedArn);
        });

        it('should warn and return the ID for unsupported keys', () => {
            const warnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});
            const att = awsElasticLoadBalancingV2ListenerRuleFunc.getAttFunc(
                'AWS::ElasticLoadBalancingV2::ListenerRule',
                'UnsupportedKey',
                'TestLogicalId',
                resource,
                mockCtx,
            );
            const expectedArn =
                'arn:aws:elasticloadbalancing:us-east-1:123456789012:listener-rule/stub-cluster/MOCKED_ALPHA/MOCKED_ALPHA/MOCKED_ALPHA';
            expect(att).toBe(expectedArn);
            expect(warnSpy).toHaveBeenCalledWith(
                `Passed key UnsupportedKey for AWS::ElasticLoadBalancingV2::ListenerRule, with logicalId=TestLogicalId is not supported, id will be returned`,
                resource,
                mockCtx,
            );
            warnSpy.mockRestore();
        });
    });

    describe('arnGenFunc', () => {
        it('should generate and assign a new ARN if none exists', () => {
            const arn = awsElasticLoadBalancingV2ListenerRuleFunc.arnGenFunc(
                'AWS::ElasticLoadBalancingV2::ListenerRule',
                'TestLogicalId',
                resource,
                mockCtx,
            );
            const expectedArn =
                'arn:aws:elasticloadbalancing:us-east-1:123456789012:listener-rule/stub-cluster/MOCKED_ALPHA/MOCKED_ALPHA/MOCKED_ALPHA';
            expect(arn).toBe(expectedArn);
            expect(resource._arn).toBe(expectedArn);
            // Verify generateAlphaNumeric was called three times.
            expect(generateAlphaNumeric).toHaveBeenCalledTimes(3);
            expect(generateAlphaNumeric).toHaveBeenNthCalledWith(1, 16, mockCtx);
            expect(generateAlphaNumeric).toHaveBeenNthCalledWith(2, 16, mockCtx);
            expect(generateAlphaNumeric).toHaveBeenNthCalledWith(3, 16, mockCtx);
        });

        it('should return the existing ARN if it is already set', () => {
            resource._arn = 'existingArn';
            const arn = awsElasticLoadBalancingV2ListenerRuleFunc.arnGenFunc(
                'AWS::ElasticLoadBalancingV2::ListenerRule',
                'TestLogicalId',
                resource,
                mockCtx,
            );
            expect(arn).toBe('existingArn');
        });
    });
});
