import { District } from './district.entity';
export declare class State {
    id: string;
    name: string;
    code: string;
    districts: District[];
    createdAt: Date;
    updatedAt: Date;
}
