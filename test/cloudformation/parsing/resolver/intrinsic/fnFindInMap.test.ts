import {
    UnexpectedVariableTypeError,
    WrongIntrinsicFormatError,
} from '../../../../../src/cloudformation/parsing/errors/errors';
import { resolveValue, ResolvingContext } from '../../../../../src/cloudformation/parsing/index';
import {
    fnFindInMap,
    validateThatCorrectIntrinsicCalled,
} from '../../../../../src/cloudformation/parsing/resolver/intrinsic';
import { UnexpectedParamError } from '../../../../../src/errors/cloudformation-errors';

jest.mock('../../../../../src/cloudformation/parsing/resolver/intrinsic/utils/intrinsic-utils', () => ({
    validateThatCorrectIntrinsicCalled: jest.fn(),
}));

jest.mock('../../../../../src/cloudformation/parsing/index', () => ({
    resolveValue: jest.fn(),
}));

describe('fnFindInMap', () => {
    let fakeCtx: ResolvingContext;

    beforeEach(() => {
        fakeCtx = {
            originalTemplate: {
                Resources: {},
                Mappings: {
                    MapName: {
                        Key1: {
                            Key2: 'ValueFound',
                        },
                    },
                },
            },
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

        // Reset mocks before each test.
        (resolveValue as jest.Mock).mockReset();
        (validateThatCorrectIntrinsicCalled as jest.Mock).mockReset();

        // By default, resolveValue returns its input (simulate a pass-through).
        (resolveValue as jest.Mock).mockImplementation((x) => x);
    });

    it('should return the mapped value when valid input is provided', () => {
        const input = { 'Fn::FindInMap': ['MapName', 'Key1', 'Key2'] };
        const result = fnFindInMap(input, fakeCtx);
        expect(result).toBe('ValueFound');
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::FindInMap');
    });

    it('should throw WrongIntrinsicFormatError if Fn::FindInMap is not an array', () => {
        const input = { 'Fn::FindInMap': 'NotAnArray' };
        expect(() => fnFindInMap(input, fakeCtx)).toThrow(WrongIntrinsicFormatError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::FindInMap');
    });

    it('should throw WrongIntrinsicFormatError if Fn::FindInMap array length is not 3', () => {
        const input = { 'Fn::FindInMap': ['MapName', 'Key1'] };
        expect(() => fnFindInMap(input, fakeCtx)).toThrow(WrongIntrinsicFormatError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::FindInMap');
    });

    it('should throw UnexpectedVariableTypeError if mapName is not a string', () => {
        // Simulate resolveValue returning a non-string for the first element.
        (resolveValue as jest.Mock)
            .mockImplementationOnce(() => 123) // for mapName
            .mockImplementationOnce((x) => x) // for level1Key
            .mockImplementationOnce((x) => x); // for level2Key

        const input = { 'Fn::FindInMap': ['MapName', 'Key1', 'Key2'] };
        expect(() => fnFindInMap(input, fakeCtx)).toThrow(UnexpectedVariableTypeError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::FindInMap');
    });

    it('should throw UnexpectedVariableTypeError if level1Key is not a string', () => {
        (resolveValue as jest.Mock)
            .mockImplementationOnce((x) => x) // mapName valid string
            .mockImplementationOnce(() => 456) // for level1Key
            .mockImplementationOnce((x) => x); // for level2Key

        const input = { 'Fn::FindInMap': ['MapName', 'Key1', 'Key2'] };
        expect(() => fnFindInMap(input, fakeCtx)).toThrow(UnexpectedVariableTypeError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::FindInMap');
    });

    it('should throw UnexpectedVariableTypeError if level2Key is not a string', () => {
        (resolveValue as jest.Mock)
            .mockImplementationOnce((x) => x) // mapName valid string
            .mockImplementationOnce((x) => x) // level1Key valid string
            .mockImplementationOnce(() => 789); // for level2Key (non-string)

        const input = { 'Fn::FindInMap': ['MapName', 'Key1', 'Key2'] };
        expect(() => fnFindInMap(input, fakeCtx)).toThrow(UnexpectedVariableTypeError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::FindInMap');
    });

    it('should throw UnexpectedParamError if template Mappings are missing', () => {
        fakeCtx.originalTemplate.Mappings = undefined;
        const input = { 'Fn::FindInMap': ['MapName', 'Key1', 'Key2'] };
        expect(() => fnFindInMap(input, fakeCtx)).toThrow(UnexpectedParamError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::FindInMap');
    });

    it('should throw UnexpectedParamError if mapping with mapName is not found', () => {
        fakeCtx.originalTemplate.Mappings = {};
        const input = { 'Fn::FindInMap': ['MapName', 'Key1', 'Key2'] };
        expect(() => fnFindInMap(input, fakeCtx)).toThrow(UnexpectedParamError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::FindInMap');
    });

    it('should throw UnexpectedParamError if level1 mapping is not found', () => {
        fakeCtx.originalTemplate.Mappings = {
            MapName: {},
        };
        const input = { 'Fn::FindInMap': ['MapName', 'Key1', 'Key2'] };
        expect(() => fnFindInMap(input, fakeCtx)).toThrow(UnexpectedParamError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::FindInMap');
    });

    it('should throw UnexpectedParamError if level2 mapping is not found (undefined)', () => {
        fakeCtx.originalTemplate.Mappings = {
            MapName: {
                Key1: {
                    Key2: undefined,
                },
            },
        };
        const input = { 'Fn::FindInMap': ['MapName', 'Key1', 'Key2'] };
        expect(() => fnFindInMap(input, fakeCtx)).toThrow(UnexpectedParamError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::FindInMap');
    });

    it('should throw UnexpectedParamError if level2 mapping is not found (null)', () => {
        fakeCtx.originalTemplate.Mappings = {
            MapName: {
                Key1: {
                    Key2: null,
                },
            },
        };
        const input = { 'Fn::FindInMap': ['MapName', 'Key1', 'Key2'] };
        expect(() => fnFindInMap(input, fakeCtx)).toThrow(UnexpectedParamError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::FindInMap');
    });
});
