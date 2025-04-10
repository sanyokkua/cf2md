import { CloudFormationResource } from '../../../parsing/types/cloudformation-model';

import { MapperInput } from '../../types/mapping-model';
import { BaseResource } from '../../types/resources-model';
import { BaseResourceMapper } from './base-mapper';

export class GenericResourceMapper extends BaseResourceMapper {
    protected override getMapperResourceType(): string {
        throw new Error('Method not implemented.');
    }

    protected override validate(): boolean {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected mapResourceSpecificProps(_mapperInput: MapperInput<CloudFormationResource>): BaseResource {
        return { logicalId: '', physicalId: '', resourceArn: '', resourceType: '' };
    }
}
