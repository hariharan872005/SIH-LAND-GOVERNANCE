import { DesignationStatus } from '../../../common/constants/status.enum';
import { Department } from './department.entity';
import { Officer } from './officer.entity';
export declare class Designation {
    id: string;
    title: string;
    code: string;
    departmentId: string;
    department: Department;
    status: DesignationStatus;
    officers: Officer[];
    createdAt: Date;
    updatedAt: Date;
}
