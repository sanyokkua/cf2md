import { BaseResource } from '../resources-model';

export type DynamoDbSchemaKeyType = 'HASH' | 'RANGE';
export type DynamoDbSchemaKeyRole = 'Partition Key' | 'Sort Key';
export const DynamoDbSchemaKeyTypeToRole: Record<DynamoDbSchemaKeyType, DynamoDbSchemaKeyRole> = {
    HASH: 'Partition Key',
    RANGE: 'Sort Key',
};

export interface DynamoDbTableKeySchema {
    attributeName: string;
    keyType: DynamoDbSchemaKeyType;
    keyRole: DynamoDbSchemaKeyRole;
}

export interface DynamoDbLocalSecondaryIndex {
    indexName: string;
    keySchema: DynamoDbTableKeySchema[];
}

export type DynamoDbGlobalSecondaryIndex = DynamoDbLocalSecondaryIndex;
export type DynamoDbAttributeType = 'S' | 'N' | 'B';
export type DynamoDbAttributeRole = 'String' | 'Number' | 'Binary';
export const DynamoDbAttributeTypeToRole: Record<DynamoDbAttributeType, DynamoDbAttributeRole> = {
    S: 'String',
    N: 'Number',
    B: 'Binary',
};

export interface DynamoDbAttribute {
    attributeName: string;
    attributeType: DynamoDbAttributeType;
    attributeRole: DynamoDbAttributeRole;
}

export interface DynamoDBColumn {
    attributeName: string;
    attributeType: DynamoDbAttributeType;
    attributeRole: DynamoDbAttributeRole;
    keyType: DynamoDbSchemaKeyType | '';
    keyRole: DynamoDbSchemaKeyRole | '';
    localIndexes: string[];
    globalIndexes: string[];
}

export interface DynamoDBModel extends BaseResource {
    tableName: string;
    columns: DynamoDBColumn[];
    attributeDefinitions: DynamoDbAttribute[];
    keySchema: DynamoDbTableKeySchema[];
    globalSecondaryIndexes: DynamoDbGlobalSecondaryIndex[];
    localSecondaryIndexes: DynamoDbLocalSecondaryIndex[];
}
