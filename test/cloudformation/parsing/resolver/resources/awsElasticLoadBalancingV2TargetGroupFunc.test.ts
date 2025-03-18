import { removePrefixIfPresent } from 'coreutilsts';
import log from 'loglevel';
import { awsElasticLoadBalancingV2TargetGroupFunc } from '../../../../../src/cloudformation/parsing/resolver/resources/awsElasticLoadBalancingV2TargetGroupFunc';
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
        (_prop: unknown, _defaultVal: string, _propName: string, _ctx: ResolvingContext) => 'resolved-tg-name',
    ),
}));

// Mock external dependency
jest.mock('coreutilsts', () => ({
    removePrefixIfPresent: jest.fn((arn: string, prefix: string) => arn.replace(prefix, '')),
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

describe('awsElasticLoadBalancingV2TargetGroupFunc', () => {
    let mockCtx: ResolvingContext;
    let resource: CloudFormationResource;

    beforeEach(() => {
        mockCtx = createMockContext();
        resource = {
            Properties: {
                Name: 'original-tg-name',
            },
        } as CloudFormationResource;
        delete resource._id;
        delete resource._arn;

        (generateAlphaNumeric as jest.Mock).mockClear();
        (resolveStringWithDefault as jest.Mock).mockClear();
        (removePrefixIfPresent as jest.Mock).mockClear();
    });

    describe('idGenFunc', () => {
        it('should generate ARN as ID when not set', () => {
            const id = awsElasticLoadBalancingV2TargetGroupFunc.idGenFunc(
                'AWS::ElasticLoadBalancingV2::TargetGroup',
                'TestTG',
                resource,
                mockCtx,
            );

            expect(id).toMatch(/arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup\/.*/);
            expect(resource._id).toEqual(id);
        });

        it('should return existing ID when present', () => {
            resource._id = 'existing-id';
            const id = awsElasticLoadBalancingV2TargetGroupFunc.idGenFunc(
                'AWS::ElasticLoadBalancingV2::TargetGroup',
                'TestTG',
                resource,
                mockCtx,
            );

            expect(id).toBe('existing-id');
            expect(generateAlphaNumeric).not.toHaveBeenCalled();
        });
    });

    describe('refFunc', () => {
        it('should return generated ARN', () => {
            const result = awsElasticLoadBalancingV2TargetGroupFunc.refFunc(
                'AWS::ElasticLoadBalancingV2::TargetGroup',
                'TestTG',
                resource,
                mockCtx,
            );

            expect(result).toMatch(
                /arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup\/resolved-tg-name\/MOCKED_ID/,
            );
        });
    });

    describe('getAttFunc', () => {
        it('should return LoadBalancerArns for valid key', () => {
            const result = awsElasticLoadBalancingV2TargetGroupFunc.getAttFunc(
                'AWS::ElasticLoadBalancingV2::TargetGroup',
                'LoadBalancerArns',
                'TestTG',
                resource,
                mockCtx,
            );

            expect(result).toBe('LoadBalancerArns');
        });

        it('should return TargetGroupArn for valid key', () => {
            const result = awsElasticLoadBalancingV2TargetGroupFunc.getAttFunc(
                'AWS::ElasticLoadBalancingV2::TargetGroup',
                'TargetGroupArn',
                'TestTG',
                resource,
                mockCtx,
            );

            expect(result).toMatch(/arn:aws:elasticloadbalancing:.*/);
        });

        it('should return TargetGroupFullName without ARN prefix', () => {
            const arn = 'arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/resolved-tg-name/MOCKED_ID';
            resource._arn = arn;

            const result = awsElasticLoadBalancingV2TargetGroupFunc.getAttFunc(
                'AWS::ElasticLoadBalancingV2::TargetGroup',
                'TargetGroupFullName',
                'TestTG',
                resource,
                mockCtx,
            );

            expect(removePrefixIfPresent).toHaveBeenCalledWith(
                arn,
                'arn:aws:elasticloadbalancing:us-east-1:123456789012:',
            );
            expect(result).toBe('targetgroup/resolved-tg-name/MOCKED_ID');
        });

        it('should extract TargetGroupName from ARN', () => {
            const arn = 'arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/resolved-tg-name/MOCKED_ID';
            resource._arn = arn;

            const result = awsElasticLoadBalancingV2TargetGroupFunc.getAttFunc(
                'AWS::ElasticLoadBalancingV2::TargetGroup',
                'TargetGroupName',
                'TestTG',
                resource,
                mockCtx,
            );

            expect(result).toBe('resolved-tg-name');
        });

        it('should warn and return ID for unsupported attributes', () => {
            const warnSpy = jest.spyOn(log, 'warn').mockImplementation();

            const result = awsElasticLoadBalancingV2TargetGroupFunc.getAttFunc(
                'AWS::ElasticLoadBalancingV2::TargetGroup',
                'InvalidAttribute',
                'TestTG',
                resource,
                mockCtx,
            );

            expect(warnSpy).toHaveBeenCalledWith(
                'Passed key InvalidAttribute for AWS::ElasticLoadBalancingV2::TargetGroup, with logicalId=TestTG is not supported, id will be returned',
                resource,
                mockCtx,
            );
            expect(result).toMatch(/arn:aws:elasticloadbalancing:.*/);
            warnSpy.mockRestore();
        });
    });

    describe('arnGenFunc', () => {
        it('should generate new ARN with proper structure', () => {
            const arn = awsElasticLoadBalancingV2TargetGroupFunc.arnGenFunc(
                'AWS::ElasticLoadBalancingV2::TargetGroup',
                'TestTG',
                resource,
                mockCtx,
            );

            // Verify ARN components
            expect(arn).toContain('arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/');
            expect(arn).toContain('/MOCKED_ID');

            // Verify name resolution
            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                'original-tg-name',
                'tg-MOCKED_ID',
                'AWS::ElasticLoadBalancingV2::TargetGroup.Properties.Name',
                mockCtx,
            );
        });

        it('should use existing ARN if present', () => {
            resource._arn = 'existing-arn';
            const arn = awsElasticLoadBalancingV2TargetGroupFunc.arnGenFunc(
                'AWS::ElasticLoadBalancingV2::TargetGroup',
                'TestTG',
                resource,
                mockCtx,
            );

            expect(arn).toBe('existing-arn');
            expect(generateAlphaNumeric).not.toHaveBeenCalled();
        });

        it('should handle missing Name property', () => {
            delete resource.Properties?.Name;

            const arn = awsElasticLoadBalancingV2TargetGroupFunc.arnGenFunc(
                'AWS::ElasticLoadBalancingV2::TargetGroup',
                'TestTG',
                resource,
                mockCtx,
            );

            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                undefined,
                'tg-MOCKED_ID',
                'AWS::ElasticLoadBalancingV2::TargetGroup.Properties.Name',
                mockCtx,
            );
            expect(arn).toContain('targetgroup/resolved-tg-name/');
        });
    });
});
