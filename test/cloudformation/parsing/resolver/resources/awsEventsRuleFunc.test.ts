import log from 'loglevel';

import { awsEventsRuleFunc } from '../../../../../src/cloudformation/parsing/resolver/resources/awsEventsRuleFunc';
import { ResolvingContext } from '../../../../../src/cloudformation/parsing/types/types';
import {
    generateAlphaNumeric,
    resolveStringWithDefault,
} from '../../../../../src/cloudformation/parsing/utils/helper-utils';
import { CloudFormationResource } from '../../../../../src/cloudformation/types/cloudformation-model';

// Mock helper functions with Jest
jest.mock('../../../../../src/cloudformation/parsing/utils/helper-utils', () => ({
    generateAlphaNumeric: jest.fn(() => 'MOCKED_ID'),
    resolveStringWithDefault: jest.fn(
        (_property: unknown, _default: string, _propertyName: string, _ctx: ResolvingContext) => 'resolvedRuleName',
    ),
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
        getRegion: jest.fn(() => 'us-west-2'),
        getPartition: jest.fn(() => 'aws'),
        getAccountId: jest.fn(() => '987654321098'),
        getAZs: jest.fn(() => ['us-west-2a', 'us-west-2b']),
    } as unknown as ResolvingContext;
}

describe('awsEventsRuleFunc', () => {
    let mockCtx: ResolvingContext;
    let resource: CloudFormationResource;

    beforeEach(() => {
        mockCtx = createMockContext();
        resource = {
            Properties: {
                Name: 'MyEventRule',
            },
        } as CloudFormationResource;

        delete resource._id;
        delete resource._arn;

        (generateAlphaNumeric as jest.Mock).mockClear();
        (resolveStringWithDefault as jest.Mock).mockClear();
    });

    describe('idGenFunc', () => {
        it('should generate a new ID with default name when none exists', () => {
            delete resource.Properties?.Name;
            const id = awsEventsRuleFunc.idGenFunc('AWS::Events::Rule', 'TestRule', resource, mockCtx);

            expect(id).toBe('resolvedRuleName');
            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                undefined,
                'rule-MOCKED_ID',
                'AWS::Events::Rule.Properties.Name',
                mockCtx,
            );
            expect(generateAlphaNumeric).toHaveBeenCalledWith(6, mockCtx);
        });

        it('should use existing ID when present', () => {
            resource._id = 'existing-id';
            const id = awsEventsRuleFunc.idGenFunc('AWS::Events::Rule', 'TestRule', resource, mockCtx);

            expect(id).toBe('existing-id');
            expect(resolveStringWithDefault).not.toHaveBeenCalled();
        });

        it('should resolve provided Name property', () => {
            const id = awsEventsRuleFunc.idGenFunc('AWS::Events::Rule', 'TestRule', resource, mockCtx);

            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                'MyEventRule',
                'rule-MOCKED_ID',
                'AWS::Events::Rule.Properties.Name',
                mockCtx,
            );
            expect(id).toBe('resolvedRuleName');
        });
    });

    describe('refFunc', () => {
        it('should return the generated ID from idGenFunc', () => {
            const ref = awsEventsRuleFunc.refFunc('AWS::Events::Rule', 'TestRule', resource, mockCtx);

            expect(ref).toBe('resolvedRuleName');
        });
    });

    describe('getAttFunc', () => {
        it('should return ARN when key is "Arn"', () => {
            const arn = awsEventsRuleFunc.getAttFunc('AWS::Events::Rule', 'Arn', 'TestRule', resource, mockCtx);

            expect(arn).toBe('arn:aws:events:us-west-2:987654321098:rule/resolvedRuleName');
        });

        it('should warn and return ID for unsupported attributes', () => {
            const warnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});
            const result = awsEventsRuleFunc.getAttFunc(
                'AWS::Events::Rule',
                'InvalidKey',
                'TestRule',
                resource,
                mockCtx,
            );

            expect(warnSpy).toHaveBeenCalledWith(
                'Passed key InvalidKey for AWS::Events::Rule, with logicalId=TestRule is not supported, id will be returned',
                resource,
                mockCtx,
            );
            expect(result).toBe('resolvedRuleName');
            warnSpy.mockRestore();
        });
    });

    describe('arnGenFunc', () => {
        it('should generate correct ARN format with context values', () => {
            const arn = awsEventsRuleFunc.arnGenFunc('AWS::Events::Rule', 'TestRule', resource, mockCtx);

            expect(arn).toBe('arn:aws:events:us-west-2:987654321098:rule/resolvedRuleName');
            expect(resource._arn).toBe(arn);
            expect(mockCtx.getRegion).toHaveBeenCalled();
            expect(mockCtx.getAccountId).toHaveBeenCalled();
        });

        it('should return existing ARN when present', () => {
            resource._arn = 'existing-arn';
            const arn = awsEventsRuleFunc.arnGenFunc('AWS::Events::Rule', 'TestRule', resource, mockCtx);

            expect(arn).toBe('existing-arn');
        });

        it('should use generated ID for rule name', () => {
            awsEventsRuleFunc.arnGenFunc('AWS::Events::Rule', 'TestRule', resource, mockCtx);

            expect(resource._arn).toContain('resolvedRuleName');
        });
    });
});
