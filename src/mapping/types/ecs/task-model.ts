import { BaseResource } from '../resources-model';

export interface Container {
    containerName: string;
    cpu: string;
    image: string;
    memory: string;
}

export interface TaskDefinitionModel extends BaseResource {
    containerDefinitions: Container[];
    cpu: string;
    ephemeralStorageSize: string; //min 21 GiB and the maximum supported value is 200 GiB.
    family: string;
    memory: string;
    runtimePlatform: {
        cpuArchitecture: string; // default X86_64 | ARM64
        operatingSystemFamily: string; // DEFAULT - LINUX
    };
}
