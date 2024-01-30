import IError from "../../../data/types/error/error";
import IResponse from "../../../data/types/response/response";
import IntegrationService from "./integration.service";


class IntegrationController {
    private _integrationService: IntegrationService;
    
    constructor({ integrationService} : { integrationService : IntegrationService}) {
        this._integrationService = integrationService;
    }

    getGasPrices = async (
        _: any,
        sendResponse: (code: number, response: IResponse<any>)=>void
    )  => {
        const response = await this._integrationService.getGasPrices();
        if (!response.data) return sendResponse(401, { error: [{ message: response.errors }], status: false });

        sendResponse(200, { data: response, status: true });
    };

    getCoinByContractAddress = async (
        { params }: { params: { token: string } },
        sendResponse: (code: number, response: IResponse<any>)=>void
    )  => {

        const response = await this._integrationService.getCoinByContractAddress({ contract_address: params.token });
        if (!response) return sendResponse(401, { error: response, status: false });
        if (!response.response) {
            return sendResponse(401, {status: false, error: [{message: 'unable to get token'}]});
        }
        if (!response.response.success) {
            return sendResponse(401, { status: false, data: [{ message: response.response.message} as IError] });
        }

        sendResponse(200, { data: response.response.contract, status: true });
    };

    getListOfTokensInWallet = async (
        { params }: { params: { token: string; } },
        sendResponse: (code: number, response: IResponse<any>)=>void
    )  => {
        const { token } = params;

        const response = await this._integrationService.getListOfTokensInWallet({ token });
        if (!response.data) return sendResponse(401, { error: response.errors, status: false });

        sendResponse(200, { data: response.data, status: true });
    };

    buyCoin = async (
        { body }: { body: any },
        sendResponse: (code: number, response: IResponse<any>)=>void
    )  => {
        const response = await this._integrationService.buyCoin(body);
        if (response.errors) return sendResponse(401, { error: response.errors, status: false });

        if (!response.response.status) {
            return sendResponse(401, {
                error: [{ message: response.response.message as string ?? 'unable to make transaction' }],
                status: false
            });
        }

        sendResponse(200, {
            data: { message: response.response.message },
            status: true
        });
    };

    sellCoin = async (
        { body }: { body: any },
        sendResponse: (code: number, response: IResponse<any>)=>void
    )  => {
        const response = await this._integrationService.sellCoin(body);
        if (!response.response) return sendResponse(401, { error: response.errors, status: false });

        if (!response?.response?.status) {
            return sendResponse(401, {
                error: [{ message: response?.response?.message as string ?? 'unable to make transaction' }],
                status: false
            });
        }

        sendResponse(200, { data: response, status: true });
    };

    limitBuyCoin = async (
        { body }: { body: any },
        sendResponse: (code: number, response: IResponse<any>)=>void
    )  => {
        const response = await this._integrationService.limitBuy(body);
        if (!response) return sendResponse(401, { error: [{ message: response }], status: false });

        sendResponse(200, { data: response, status: true });
    };

    limitSellCoin = async (
        { body }: { body: any },
        sendResponse: (code: number, response: IResponse<any>)=>void
    )  => {
        const response = await this._integrationService.limitSell(body);
        if (!response) return sendResponse(401, { error: [{ message: response }], status: false });

        sendResponse(200, { data: response, status: true });
    };

    importWallet = async (
        { body }: { body: any },
        sendResponse: (code: number, response: IResponse<any>)=>void
    )  => {
        const response = await this._integrationService.importWallet(body);
        if (!response.data) return sendResponse(401, { error: response.errors, status: false });

        sendResponse(200, { data: response, status: true });
    };

    transferEth = async (
        { body }: { body: any },
        sendResponse: (code: number, response: IResponse<any>)=>void
    )  => {
        console.log('body', body)
        const response = await this._integrationService.transferEth(body);
        if (!response.data) return sendResponse(401, { error: response.errors, status: false });

        sendResponse(200, { data: response, status: true });
    };

    transferToken = async (
        { body }: { body: any },
        sendResponse: (code: number, response: IResponse<any>)=>void
    )  => {
        console.log(body);
        const response = await this._integrationService.transferToken(body);
        if (!response.data) return sendResponse(401, { error: response.errors, status: false });

        sendResponse(200, { data: response, status: true });
    };

    getBalance = async (
        { params }: { params: any },
        sendResponse: (code: number, response: IResponse<any>)=>void
    )  => {
        const response = await this._integrationService.getBalance(params.token);
        if (!response.data) return sendResponse(401, { error: response.errors, status: false });

        sendResponse(200, { data: response.data, status: true });
    };

    marketSwapCoin = async (
        { body }: { body: any },
        sendResponse: (code: number, response: IResponse<any>)=>void
    )  => {
        const response = await this._integrationService.marketSwapCoin(body);
        if (!response.response) return sendResponse(401, { error: response.errors, status: false });

        if (!response?.response?.status) {
            return sendResponse(401, {
                error: [{ message: response?.response?.message as string ?? 'unable to make transaction' }],
                status: false
            });
        }

        sendResponse(200, { data: response, status: true });
    };
}

export default IntegrationController;


// how to validate email?