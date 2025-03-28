import { IntrinsicContext, ResourceIntrinsic } from '../../types/intrinsic-types';
import { ResourceUtils } from '../../types/util-service-types';

export abstract class BaseResource implements ResourceIntrinsic {
    constructor(protected readonly resourceUtils: ResourceUtils) {}

    refFunc(context: IntrinsicContext): string {
        // Most part of the CF Resources are returning physical ID (or Name if it is used as ID) of the resource for Ref
        return this.idGenFunc(context);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAttFunc(context: IntrinsicContext, _key: string): unknown {
        // Most part of the CF Resources are returning physical ID of the resource for GetArr
        return this.idGenFunc(context);
    }

    idGenFunc(context: IntrinsicContext): string {
        const { resource, ctx } = context;
        if (!resource._id) {
            resource._id = this.resourceUtils.generateAlphaNumeric(6, ctx);
        }
        return resource._id;
    }

    abstract arnGenFunc(context: IntrinsicContext): string;
}
