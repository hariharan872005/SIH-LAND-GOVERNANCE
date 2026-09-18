import { Permission } from './permission.entity';
import { Officer } from './officer.entity';
export declare class Role {
    id: string;
    name: string;
    departmentId: string;
    description: string;
    isSystemRole: boolean;
    permissions: Permission[];
    officers: Officer[];
    createdAt: Date;
    updatedAt: Date;
}
