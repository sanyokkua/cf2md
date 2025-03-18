import log from 'loglevel';
import { ResolvingContext } from '../types/types';
import { isIntrinsic } from './intrinsic';
import { intrinsicResolver } from './intrinsic-func-resolver';

/**
 * Recursively resolves values containing CloudFormation intrinsic functions.
 *
 * This function traverses the provided value, processing intrinsic functions if present. It handles
 * arrays, objects, and primitive values as follows:
 *
 * - **Arrays**: Each element is recursively processed.
 * - **Objects**:
 *   - First, it checks if the object is an intrinsic function using `isIntrinsic`.
 *   - If it is an intrinsic, the function resolves it using the corresponding resolver from `intrinsicResolver`
 *     and temporarily updates the resolution context.
 *   - If it is not an intrinsic, each property of the object is recursively resolved.
 * - **Primitive values**: These are returned without modification.
 *
 * The resolution context (`ctx`) maintains state (like the current resolution path), which aids in debugging
 * complex, nested intrinsic resolutions.
 *
 * @param value - The value (object, array, or primitive) to be resolved.
 * @param ctx - The resolution context that tracks state and helps resolve intrinsics.
 * @returns The fully resolved value.
 *
 * @example
 * // Given a CloudFormation intrinsic in the template:
 * const templateValue = { "Fn::Join": [",", ["a", "b", "c"]] };
 * const resolvedValue = resolveValue(templateValue, myResolvingContext);
 */
export function resolveValue(value: unknown, ctx: ResolvingContext): unknown {
    log.trace(`Resolving value at path: ${ctx.getCurrentPath()}`);

    // Handle array values by recursively resolving each element.
    if (Array.isArray(value)) {
        log.debug(`Encountered array at path: ${ctx.getCurrentPath()}`);
        return value.map((item) => resolveValue(item, ctx));
    }

    // Handle object values (excluding null).
    if (value !== null && typeof value === 'object') {
        // Check whether the object is an intrinsic function.
        const [isIntrinsicObj, intrinsicKey] = isIntrinsic(value);

        // If the object represents an intrinsic function, resolve it.
        if (isIntrinsicObj && intrinsicKey) {
            log.debug(`Found intrinsic "${intrinsicKey}" at path: ${ctx.getCurrentPath()}`);
            ctx.addName(intrinsicKey); // Add the intrinsic key to the resolution path for debugging.
            const intrinsicFunc = intrinsicResolver(intrinsicKey);
            try {
                const result = intrinsicFunc(value, ctx);
                log.debug(`Intrinsic "${intrinsicKey}" resolved to:`, result);
                return result;
            } catch (error) {
                // Log an error if intrinsic resolution fails.
                log.error(`Error resolving intrinsic "${intrinsicKey}" at path: ${ctx.getCurrentPath()}`, error);
                throw error;
            } finally {
                ctx.popName(); // Remove the intrinsic key from the path after resolution.
            }
        } else {
            // If the object is not an intrinsic, recursively resolve its properties.
            const obj = value as Record<string, unknown>;
            const result: Record<string, unknown> = {};
            log.debug(`Recursively resolving object at path: ${ctx.getCurrentPath()}`);
            // Iterate over all properties of the object.
            for (const key of Object.keys(obj)) {
                ctx.addName(key); // Add property key to current resolution path.
                result[key] = resolveValue(obj[key], ctx); // Recursively resolve property value.
                ctx.popName(); // Remove the property key after processing.
            }
            return result;
        }
    }

    // For primitive values (string, number, boolean, etc.), no resolution is needed.
    log.trace(`Returning primitive value at path: ${ctx.getCurrentPath()}: ${String(value)}`);
    return value;
}
