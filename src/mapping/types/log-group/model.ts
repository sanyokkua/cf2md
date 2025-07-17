import { BaseResource } from '../resources-model';

export type RetentionNeverExpire = 'NEVER_EXPIRE';
export type RetentionInDays =
    | RetentionNeverExpire
    | '1'
    | '3'
    | '5'
    | '7'
    | '14'
    | '30'
    | '60'
    | '90'
    | '120'
    | '150'
    | '180'
    | '365'
    | '400'
    | '545'
    | '731'
    | '1096'
    | '1827'
    | '2192'
    | '2557'
    | '2922'
    | '3288'
    | '3653';
export type LogGroupClass = 'STANDARD' | 'INFREQUENT_ACCESS' | 'DELIVERY';

export interface LogsLogGroupModel extends BaseResource {
    logGroupClass: LogGroupClass;
    logGroupName: string;
    retentionInDays: RetentionInDays;
}
