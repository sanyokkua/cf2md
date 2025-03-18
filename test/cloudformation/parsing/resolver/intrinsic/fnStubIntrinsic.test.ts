import log from 'loglevel';
import { ResolvingContext } from '../../../../../src/cloudformation/parsing/index';
import { stubIntrinsic } from '../../../../../src/cloudformation/parsing/resolver/intrinsic';

describe('stubIntrinsic', () => {
    let fakeCtx: ResolvingContext;

    beforeEach(() => {
        fakeCtx = {
            originalTemplate: {} as any,
            lookupMapPreProcessed: {},
            generatedIds: new Set(),
            lookupMapDynamic: {},
            currentPath: [],
            addName: jest.fn(),
            popName: jest.fn(),
            getCurrentPath: jest.fn(() => ''),
            hasParameterName: jest.fn(),
            getParameter: jest.fn(),
            addParameter: jest.fn(),
            addGeneratedId: jest.fn(),
            isIdExists: jest.fn(() => false),
            getRegion: jest.fn(() => 'us-east-1'),
            getPartition: jest.fn(() => 'aws'),
            getAccountId: jest.fn(() => '123456789012'),
            getAZs: jest.fn(() => ['us-east-1a', 'us-east-1b']),
        };
    });

    it('should log the call and return "stubIntrinsic"', () => {
        const logSpy = jest.spyOn(log, 'trace').mockImplementation(() => {});
        const node = { some: 'data' };

        const result = stubIntrinsic(node, fakeCtx);

        expect(result).toBe('stubIntrinsic');
        expect(logSpy).toHaveBeenCalledWith('stubIntrinsic is called', node, fakeCtx);

        logSpy.mockRestore();
    });
});
