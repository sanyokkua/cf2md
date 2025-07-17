export interface BaseResource {
    resourceType: string;
    resourceArn: string;
    physicalId: string;
    logicalId: string;
    creationPolicy?: string;
    deletionPolicy?: string;
    dependsOn?: string;
    updatePolicy?: string;
    updateReplacePolicy?: string;
}

export type YesNoType = 'Yes' | 'No' | '';
