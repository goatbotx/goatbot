import BaseValidator from "../../../data/repository/validator/validator";
import IError from "../../../data/types/error/error";

class IntegrationValidator  extends BaseValidator{
  validateLimitOption =  (option: { limit: number; page: number }): IError[] => {
    const errors: IError[] = [];

    const validateLimit = this._validateNumber(option.limit);
    if ( validateLimit.message ) {
      errors.push({ field: 'limit', message: validateLimit.message });
    }

    const validatePage = this._validateNumber(option.page);
    if ( validatePage.message ) {
      errors.push({ field: 'limit', message: validatePage.message });
    }

    return errors;
  }

  validateInfo =  ({ user_id, wallet_address}: {user_id: string; wallet_address: string}): IError[] => {
    const errors: IError[] = [];

    const validateID = this._validateID(user_id);
    if ( validateID.message ) {
      errors.push({ field: 'user_id', message: validateID.message });
    }
    const validateWallet = this._validateID(wallet_address);
    if ( validateWallet.message ) {
      errors.push({ field: 'wallet_address', message: validateWallet.message });
    }

    return errors;
  }
};

export default IntegrationValidator;
