import { SurveyService } from './survey.service';
import { SubmitSurveyDto } from './dto/submit-survey.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
export declare class SurveyController {
    private readonly surveyService;
    constructor(surveyService: SurveyService);
    submitSurvey(dto: SubmitSurveyDto, surveyor: AuthenticatedUser): Promise<import("../lands/entities/land-parcel.entity").LandParcel>;
}
