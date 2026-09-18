import { LandTransferService } from './land-transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
export declare class LandTransferController {
    private readonly transferService;
    constructor(transferService: LandTransferService);
    executeTransfer(dto: CreateTransferDto, subRegistrar: AuthenticatedUser, headers: Record<string, string>): Promise<any>;
    getTransfers(landId: string): Promise<import("./entities/land-transfer.entity").LandTransfer[]>;
    getOwnershipHistory(landId: string): Promise<import("../lands/entities/land-ownership-history.entity").LandOwnershipHistory[]>;
}
