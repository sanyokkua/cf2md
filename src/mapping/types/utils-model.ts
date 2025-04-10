import { StringKeyValueObject } from '../../common';

export interface MapperUtil {
    extractString(input: unknown): string;
    extractStringOrDefault(input: unknown, defaultValue: string): string;
    extractStringOrDefaultFromMap(input: unknown, defaultValueKey: string, defaultValues: StringKeyValueObject): string;
    extractStringOrJsonStringOrEmptyString(input: unknown): string;
}

export interface IntegrationUriArn {
    integrationServiceRegion: string;
    integrationService: string;
    integrationServiceSubdomain?: string;
    integrationServiceActionType: 'action' | 'path';
    integrationServiceAction: string;
}

export interface IntegrationUriUtils {
    isValidIntegrationUri(input: string): boolean;

    parseIntegrationUri(input: string): IntegrationUriArn;
}
