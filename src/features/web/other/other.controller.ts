import IResponse from "../../../data/types/response/response";
import IntegrationService from "./other.service";


class OtherController {
    private _otherService: IntegrationService;
    
    constructor({ otherService} : { otherService : IntegrationService}) {
        this._otherService = otherService;
    }

    addReferralCode = async (
        { body }: { body: any },
        sendResponse: (code: number, response: IResponse<any>)=>void
    )  => {
        const response = await this._otherService.addReferralCode(body);
        if (!response.message) return sendResponse(401, { error: response.errors, status: false });

        if (!response?.message) {
            return sendResponse(401, {
                error: [{ message: 'unable to make transaction' }],
                status: false
            });
        }

        sendResponse(200, { data: response.message, status: true });
    };
}

export default OtherController;