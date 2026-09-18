import { State } from './state.entity';
import { Taluk } from './taluk.entity';
export declare class District {
    id: string;
    name: string;
    stateId: string;
    state: State;
    taluks: Taluk[];
    createdAt: Date;
    updatedAt: Date;
}
