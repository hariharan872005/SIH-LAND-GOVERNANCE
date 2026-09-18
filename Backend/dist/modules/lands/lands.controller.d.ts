import { LandsService } from './lands.service';
import { CreateLandDto } from './dto/create-land.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { LandStatus } from '../../common/constants/status.enum';
export declare class LandsController {
    private readonly landsService;
    constructor(landsService: LandsService);
    createLand(createLandDto: CreateLandDto, officer: AuthenticatedUser): Promise<import("./entities/land-parcel.entity").LandParcel>;
    getLands(pagination: PaginationDto, stateId?: string, districtId?: string, talukId?: string, status?: LandStatus, landType?: string, officer?: AuthenticatedUser): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/land-parcel.entity").LandParcel>>;
    getLandById(id: string): Promise<import("./entities/land-parcel.entity").LandParcel>;
}
