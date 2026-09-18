import { DepartmentStatus } from '../../../common/constants/status.enum';
import { Designation } from './designation.entity';
import { Officer } from './officer.entity';
export declare class Department {
    id: string;
    name: string;
    code: string;
    description: string;
    status: DepartmentStatus;
    designations: Designation[];
    officers: Officer[];
    createdAt: Date;
    updatedAt: Date;
}
