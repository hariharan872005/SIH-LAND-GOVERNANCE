import { District } from './district.entity';
import { Village } from './village.entity';
export declare class Taluk {
    id: string;
    name: string;
    districtId: string;
    district: District;
    villages: Village[];
    createdAt: Date;
    updatedAt: Date;
}
