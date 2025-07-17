import { CfResourcesType } from '../../../parsing';
import { DynamoDBTableResource, KeySchema } from '../../../parsing/types/cloudformation-model';
import {
    DynamoDbAttribute,
    DynamoDbAttributeType,
    DynamoDbAttributeTypeToRole,
    DynamoDBColumn,
    DynamoDbGlobalSecondaryIndex,
    DynamoDbLocalSecondaryIndex,
    DynamoDBModel,
    DynamoDbSchemaKeyType,
    DynamoDbSchemaKeyTypeToRole,
    DynamoDbTableKeySchema,
} from '../../types/dynamodb/model';
import { MapperInput } from '../../types/mapping-model';
import { BaseResourceMapper } from './base-mapper';

export class DynamoDBMapper extends BaseResourceMapper {
    protected override getMapperResourceType(): string {
        return CfResourcesType.AWS_DynamoDB_Table;
    }

    private extractKeySchemaAttribute(keySchema: KeySchema): DynamoDbTableKeySchema {
        const attributeName = this.mapperUtils.extractString(keySchema.AttributeName);
        const keyType = this.mapperUtils.extractString(keySchema.KeyType) as DynamoDbSchemaKeyType;
        const keyRole = DynamoDbSchemaKeyTypeToRole[keyType];
        return {
            attributeName: attributeName,
            keyType: keyType,
            keyRole: keyRole,
        };
    }

    private mapKeySchema(keySchemas: KeySchema[]): DynamoDbTableKeySchema[] {
        return keySchemas.map((schema) => this.extractKeySchemaAttribute(schema));
    }

    protected mapResourceSpecificProps(mapperInput: MapperInput<DynamoDBTableResource>): DynamoDBModel {
        const resource = mapperInput.resource;
        const tableName = this.mapperUtils.extractString(resource._id);
        const attributes = resource.Properties.AttributeDefinitions || [];
        const keySchema = resource.Properties.KeySchema;
        const localIndexes = resource.Properties.LocalSecondaryIndexes || [];
        const globalIndexes = resource.Properties.GlobalSecondaryIndexes || [];

        const mappedAttributeDefinitions: DynamoDbAttribute[] = attributes.map((attr) => {
            const attributeName = this.mapperUtils.extractString(attr.AttributeName);
            const attributeType = this.mapperUtils.extractString(attr.AttributeType) as DynamoDbAttributeType;
            const attributeRole = DynamoDbAttributeTypeToRole[attributeType];
            return {
                attributeName: attributeName,
                attributeType: attributeType,
                attributeRole: attributeRole,
            };
        });
        const mappedKeySchema: DynamoDbTableKeySchema[] = this.mapKeySchema(keySchema);
        const mappedLocalIndexes: DynamoDbLocalSecondaryIndex[] = localIndexes.map((localIndex) => {
            const mappedKeySchema = this.mapKeySchema(localIndex.KeySchema);
            return {
                indexName: this.mapperUtils.extractString(localIndex.IndexName),
                keySchema: mappedKeySchema,
            };
        });
        const mappedGlobalIndexes: DynamoDbGlobalSecondaryIndex[] = globalIndexes.map((globalIndex) => {
            const mappedKeySchema = this.mapKeySchema(globalIndex.KeySchema);
            return {
                indexName: this.mapperUtils.extractString(globalIndex.IndexName),
                keySchema: mappedKeySchema,
            };
        });

        const columns: DynamoDBColumn[] = mappedAttributeDefinitions.map((attribute) => {
            const name = attribute.attributeName;
            const attributeType = attribute.attributeType;
            const attributeRole = attribute.attributeRole;
            const keySchema = mappedKeySchema.find((attr) => {
                return attr.attributeName === name;
            });
            const keySchemaType = keySchema ? keySchema.keyType : '';
            const keySchemaRole = keySchema ? keySchema.keyRole : '';

            const localIndexes: string[] = mappedLocalIndexes
                .filter((idx) => {
                    return idx.keySchema.some((val) => {
                        return val.attributeName === name;
                    });
                })
                .map((idx) => idx.indexName);

            const globalIndexes: string[] = mappedGlobalIndexes
                .filter((idx) => {
                    return idx.keySchema.some((val) => {
                        return val.attributeName === name;
                    });
                })
                .map((idx) => idx.indexName);

            return {
                attributeName: name,
                attributeType: attributeType,
                attributeRole: attributeRole,
                keyType: keySchemaType,
                keyRole: keySchemaRole,
                localIndexes: localIndexes,
                globalIndexes: globalIndexes,
            };
        });

        return {
            tableName: tableName,
            columns: columns,
            attributeDefinitions: mappedAttributeDefinitions,
            keySchema: mappedKeySchema,
            globalSecondaryIndexes: mappedGlobalIndexes,
            localSecondaryIndexes: mappedLocalIndexes,
        } as DynamoDBModel;
    }
}
