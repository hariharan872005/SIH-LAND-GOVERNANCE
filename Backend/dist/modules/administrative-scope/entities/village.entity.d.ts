import { Taluk } from './taluk.entity';
export declare class Village {
    id: string;
    name: string;
    talukId: string;
    taluk: Taluk;
    createdAt: Date;
    updatedAt: Date;
}
