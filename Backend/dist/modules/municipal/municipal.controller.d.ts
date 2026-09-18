import { MunicipalService } from './municipal.service';
import { VerifyMunicipalDto } from './dto/verify-municipal.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
export declare class MunicipalController {
    private readonly municipalService;
    constructor(municipalService: MunicipalService);
    verifyMunicipal(dto: VerifyMunicipalDto, officer: AuthenticatedUser): Promise<import("../lands/entities/land-parcel.entity").LandParcel>;
}
