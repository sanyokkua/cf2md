import { randomArray, randomInteger, randomString } from '../../../utils/random-utils';

/**
 * Generates a stub value based on the parameter type.
 *
 * This function maps a given CloudFormation parameter type to a generated stub value.
 * It handles common types (e.g., String, Number) as well as AWS-specific types.
 *
 * @param {string} paramType - The CloudFormation parameter type.
 * @returns {unknown} A stub value corresponding to the given type.
 */
export function generateStubOnType(paramType: string): unknown {
    switch (paramType) {
        case 'String':
            return randomString();

        case 'Number':
        case 'Integer':
            return randomInteger();

        case 'List<Number>':
            return randomArray<number>(() => randomInteger());

        case 'CommaDelimitedList':
            return randomArray<string>(() => randomString(3, 10)).join(',');

        default:
            // Handle generic list types (e.g. "List<String>")
            if (paramType.startsWith('List<') && paramType.endsWith('>')) {
                const innerType = paramType.slice(5, -1);
                if (innerType === 'Integer') {
                    return randomArray<number>(() => randomInteger());
                }
                // Default inner type stub is a list of strings.
                return randomArray<string>(() => randomString());
            }
            // Handle AWS-specific parameter types (e.g., "AWS::EC2::KeyPair::KeyName")
            if (paramType.startsWith('AWS::')) {
                return `Stub${randomString(4, 8)}`;
            }
            // Fallback stub for any unrecognized type.
            return 'StubValue';
    }
}
