import log from 'loglevel';
import { awsEventsEventBusPolicyFunc } from '../../../../../src/cloudformation/parsing/resolver/resources/awsEventsEventBusPolicyFunc';
import { ResolvingContext } from '../../../../../src/cloudformation/parsing/types/types';
import { CloudFormationResource } from '../../../../../src/cloudformation/types/cloudformation-model';

// Mock helper utilities with TypeScript casting
jest.mock('../../../../../src/cloudformation/parsing/utils/helper-utils', () => ({
    generateAlphaNumeric: jest.fn((_length: number, _ctx: ResolvingContext) => 'MOCKED_ID'),
    resolveStringWithDefault: jest.fn(
        (_prop: unknown, _defaultVal: string, _propName: string, _ctx: ResolvingContext) => 'resolved-eventbus-name',
    ),
}));

/**
 * Creates a mock ResolvingContext for use in tests.
 *
 * @returns {ResolvingContext} The mock context.
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

describe('awsEventsEventBusPolicyFunc', () => {
    let resource: CloudFormationResource;
    let context: ResolvingContext;
    let logTraceSpy: jest.SpyInstance;
    let logWarnSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.resetAllMocks();
        // Reset resource and context for each test.
        resource = {} as CloudFormationResource;
        context = createMockContext();

        // Reset mocked log functions.
        logTraceSpy = jest.spyOn(log, 'trace').mockImplementation(() => {});
        logWarnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});
    });

    describe('idGenFunc', () => {
        /**
         * Test that idGenFunc generates an ID when none has been set.
         */
        it('should generate an ID when none exists', () => {
            const logicalId = 'TestLogicalId';
            const generatedId = awsEventsEventBusPolicyFunc.idGenFunc(
                'AWS::Events::EventBusPolicy',
                logicalId,
                resource,
                context,
            );

            expect(generatedId).toBe(logicalId);
            expect(resource._id).toBe(logicalId);
            expect(logTraceSpy).toHaveBeenCalledWith(
                expect.stringContaining(
                    `Called idGenFunc, for AWS::Events::EventBusPolicy, with logicalId=${logicalId}`,
                ),
                resource,
                context,
            );
        });

        /**
         * Test that idGenFunc returns the existing ID if already set.
         */
        it('should return the existing ID when already set', () => {
            const logicalId = 'TestLogicalId';
            resource._id = 'ExistingId';

            const result = awsEventsEventBusPolicyFunc.idGenFunc(
                'AWS::Events::EventBusPolicy',
                logicalId,
                resource,
                context,
            );

            expect(result).toBe('ExistingId');
        });
    });

    describe('arnGenFunc', () => {
        /**
         * Test that arnGenFunc constructs a proper ARN when none exists.
         */
        it('should generate an ARN when none exists', () => {
            const logicalId = 'TestLogicalId';

            // Since resource._id is not set, idGenFunc will assign it to logicalId.
            const arn = awsEventsEventBusPolicyFunc.arnGenFunc(
                'AWS::Events::EventBusPolicy',
                logicalId,
                resource,
                context,
            );

            // Expected ARN format: arn:{partition}:events:{region}:{accountId}:event-bus-policy/{policyId}
            const expectedArn = `arn:aws:events:us-east-1:123456789012:event-bus-policy/${logicalId}`;

            expect(arn).toBe(expectedArn);
            expect(resource._arn).toBe(expectedArn);
            // Validate that context methods were used properly.
            expect(context.getRegion).toHaveBeenCalled();
            expect(context.getPartition).toHaveBeenCalled();
            expect(context.getAccountId).toHaveBeenCalled();
        });

        /**
         * Test that arnGenFunc returns the existing ARN if already set.
         */
        it('should return the existing ARN when already set', () => {
            const logicalId = 'TestLogicalId';
            const preSetArn = 'arn:aws:events:us-east-1:000000000000:event-bus-policy/ExistingId';
            resource._arn = preSetArn;

            const arn = awsEventsEventBusPolicyFunc.arnGenFunc(
                'AWS::Events::EventBusPolicy',
                logicalId,
                resource,
                context,
            );

            expect(arn).toBe(preSetArn);
            // Since _arn exists, context methods should not be re-invoked.
            expect(context.getRegion).not.toHaveBeenCalled();
            expect(context.getPartition).not.toHaveBeenCalled();
            expect(context.getAccountId).not.toHaveBeenCalled();
        });

        /**
         * Test ARN format validation using a regular expression.
         */
        it('should construct the ARN with proper format', () => {
            const logicalId = 'AnotherLogicalId';
            // Ensure resource has no _arn.
            delete resource._arn;
            const arn = awsEventsEventBusPolicyFunc.arnGenFunc(
                'AWS::Events::EventBusPolicy',
                logicalId,
                resource,
                context,
            );

            // In this case, idGenFunc uses the logicalId as policyId.
            const arnRegex = /^arn:aws:events:us-east-1:123456789012:event-bus-policy\/AnotherLogicalId$/;
            expect(arn).toMatch(arnRegex);
        });

        /**
         * Test that if a custom ID is already set, the ARN uses it.
         */
        it('should use the existing resource _id for ARN generation if set', () => {
            const logicalId = 'TestLogicalId';
            resource._id = 'CustomId';
            // Do not set _arn so that arnGenFunc calls idGenFunc (which will now read the existing _id).
            const arn = awsEventsEventBusPolicyFunc.arnGenFunc(
                'AWS::Events::EventBusPolicy',
                logicalId,
                resource,
                context,
            );
            const expectedArn = `arn:aws:events:us-east-1:123456789012:event-bus-policy/CustomId`;
            expect(arn).toBe(expectedArn);
        });
    });

    describe('refFunc', () => {
        /**
         * Test that refFunc delegates to arnGenFunc and returns the generated ARN.
         */
        it('should delegate to arnGenFunc and return its ARN', () => {
            const logicalId = 'TestLogicalId';

            // Capture the ARN from arnGenFunc.
            const arnFromArnGen = awsEventsEventBusPolicyFunc.arnGenFunc(
                'AWS::Events::EventBusPolicy',
                logicalId,
                resource,
                context,
            );
            // Call refFunc which internally calls arnGenFunc.
            const refResult = awsEventsEventBusPolicyFunc.refFunc(
                'AWS::Events::EventBusPolicy',
                logicalId,
                resource,
                context,
            );
            expect(refResult).toBe(arnFromArnGen);

            expect(logTraceSpy).toHaveBeenCalledWith(
                expect.stringContaining(`Called refFunc, for AWS::Events::EventBusPolicy, with logicalId=${logicalId}`),
                resource,
                context,
            );
        });
    });

    describe('getAttFunc', () => {
        it('should log a warning and return the ID from idGenFunc for unsupported attributes', () => {
            const logicalId = 'TestLogicalId';
            const attributeKey = 'UnsupportedAttribute';

            // Call getAttFunc with an attribute key that is not supported.
            const getAttResult = awsEventsEventBusPolicyFunc.getAttFunc(
                'AWS::Events::EventBusPolicy',
                attributeKey,
                logicalId,
                resource,
                context,
            );

            // Since idGenFunc is used inside getAttFunc, the resource._id
            // should be set to the logicalId.
            expect(resource._id).toBe(logicalId);
            expect(getAttResult).toBe(logicalId);

            // Validate that both trace and warning logs were triggered.
            expect(logTraceSpy).toHaveBeenCalledWith(
                expect.stringContaining(
                    `Called getAttFunc, for AWS::Events::EventBusPolicy, with logicalId=${logicalId}, and key=${attributeKey}`,
                ),
                resource,
                context,
            );
            expect(logWarnSpy).toHaveBeenCalledWith(
                `Passed key ${attributeKey} for AWS::Events::EventBusPolicy, with logicalId=${logicalId} is not supported, id will be returned`,
                resource,
                context,
            );
        });

        /**
         * Test that getAttFunc handles an empty attribute key.
         */
        it('should log a warning and return the ID when attribute key is empty', () => {
            const logicalId = 'TestLogicalId';
            const attributeKey = '';

            const getAttResult = awsEventsEventBusPolicyFunc.getAttFunc(
                'AWS::Events::EventBusPolicy',
                attributeKey,
                logicalId,
                resource,
                context,
            );

            expect(resource._id).toBe(logicalId);
            expect(getAttResult).toBe(logicalId);
            expect(logWarnSpy).toHaveBeenCalledWith(
                `Passed key ${attributeKey} for AWS::Events::EventBusPolicy, with logicalId=${logicalId} is not supported, id will be returned`,
                resource,
                context,
            );
        });
    });
});
