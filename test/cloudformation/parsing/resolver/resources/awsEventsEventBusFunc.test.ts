import log from 'loglevel';
import { awsEventsEventBusFunc } from '../../../../../src/cloudformation/parsing/resolver/resources/awsEventsEventBusFunc';
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
        (_prop: unknown, _defaultVal: string, _propName: string, _ctx: ResolvingContext) => 'resolved-eventbus-name',
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

describe('awsEventsEventBusFunc', () => {
    let mockCtx: ResolvingContext;
    let resource: CloudFormationResource;

    beforeEach(() => {
        mockCtx = createMockContext();
        resource = {
            Properties: {
                Name: 'custom-event-bus',
            },
        } as CloudFormationResource;
        delete resource._id;
        delete resource._arn;

        (generateAlphaNumeric as jest.Mock).mockClear();
        (resolveStringWithDefault as jest.Mock).mockClear();
    });

    describe('idGenFunc', () => {
        it('should generate ID from Name property when not set', () => {
            const id = awsEventsEventBusFunc.idGenFunc('AWS::Events::EventBus', 'TestEventBus', resource, mockCtx);

            expect(id).toBe('resolved-eventbus-name');
            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                'custom-event-bus',
                'eventbus-MOCKED_ID',
                'AWS::Events::EventBus.Properties.Name',
                mockCtx,
            );
            expect(resource._id).toBe(id);
        });

        it('should use default name pattern when Name is missing', () => {
            delete resource.Properties?.Name;

            const id = awsEventsEventBusFunc.idGenFunc('AWS::Events::EventBus', 'TestEventBus', resource, mockCtx);

            expect(id).toBe('resolved-eventbus-name');
            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                undefined,
                'eventbus-MOCKED_ID',
                'AWS::Events::EventBus.Properties.Name',
                mockCtx,
            );
        });

        it('should return existing ID when present', () => {
            resource._id = 'existing-bus-id';
            const id = awsEventsEventBusFunc.idGenFunc('AWS::Events::EventBus', 'TestEventBus', resource, mockCtx);

            expect(id).toBe('existing-bus-id');
            expect(resolveStringWithDefault).not.toHaveBeenCalled();
        });
    });

    describe('refFunc', () => {
        it('should return generated ID from idGenFunc', () => {
            const result = awsEventsEventBusFunc.refFunc('AWS::Events::EventBus', 'TestEventBus', resource, mockCtx);

            expect(result).toBe('resolved-eventbus-name');
        });
    });

    describe('getAttFunc', () => {
        it('should return ARN for valid "Arn" attribute', () => {
            const arn = awsEventsEventBusFunc.arnGenFunc('AWS::Events::EventBus', 'TestEventBus', resource, mockCtx);

            const result = awsEventsEventBusFunc.getAttFunc(
                'AWS::Events::EventBus',
                'Arn',
                'TestEventBus',
                resource,
                mockCtx,
            );

            expect(result).toBe(arn);
        });

        it('should return Name for valid "Name" attribute', () => {
            const result = awsEventsEventBusFunc.getAttFunc(
                'AWS::Events::EventBus',
                'Name',
                'TestEventBus',
                resource,
                mockCtx,
            );

            expect(result).toBe('resolved-eventbus-name');
        });

        it('should warn and return ID for unsupported attributes', () => {
            const warnSpy = jest.spyOn(log, 'warn').mockImplementation();

            const result = awsEventsEventBusFunc.getAttFunc(
                'AWS::Events::EventBus',
                'InvalidProp',
                'TestEventBus',
                resource,
                mockCtx,
            );

            expect(warnSpy).toHaveBeenCalledWith(
                'Passed key InvalidProp for AWS::Events::EventBus, with logicalId=TestEventBus is not supported, id will be returned',
                resource,
                mockCtx,
            );
            expect(result).toBe('resolved-eventbus-name');
            warnSpy.mockRestore();
        });
    });

    describe('arnGenFunc', () => {
        it('should generate ARN with correct components', () => {
            const arn = awsEventsEventBusFunc.arnGenFunc('AWS::Events::EventBus', 'TestEventBus', resource, mockCtx);

            expect(arn).toBe('arn:aws:events:us-east-1:123456789012:event-bus/resolved-eventbus-name');
            expect(mockCtx.getRegion).toHaveBeenCalled();
            expect(mockCtx.getPartition).toHaveBeenCalled();
            expect(mockCtx.getAccountId).toHaveBeenCalled();
        });

        it('should use existing ARN when present', () => {
            resource._arn = 'existing-arn';
            const arn = awsEventsEventBusFunc.arnGenFunc('AWS::Events::EventBus', 'TestEventBus', resource, mockCtx);

            expect(arn).toBe('existing-arn');
            expect(mockCtx.getRegion).not.toHaveBeenCalled();
        });

        it('should use generated ID for ARN construction', () => {
            const idSpy = jest.spyOn(awsEventsEventBusFunc, 'idGenFunc');

            const arn = awsEventsEventBusFunc.arnGenFunc('AWS::Events::EventBus', 'TestEventBus', resource, mockCtx);

            expect(idSpy).toHaveBeenCalled();
            expect(arn).toContain('resolved-eventbus-name');
        });

        it('should handle different partition and region values', () => {
            (mockCtx.getPartition as jest.Mock).mockReturnValue('aws-cn');
            (mockCtx.getRegion as jest.Mock).mockReturnValue('cn-north-1');

            const arn = awsEventsEventBusFunc.arnGenFunc('AWS::Events::EventBus', 'TestEventBus', resource, mockCtx);

            expect(arn).toBe('arn:aws-cn:events:cn-north-1:123456789012:event-bus/resolved-eventbus-name');
        });
    });
});
