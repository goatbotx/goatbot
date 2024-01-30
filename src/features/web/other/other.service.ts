import { UserModel } from "../../../data/repository/database/models/user";
import EncryptionRepository, { TokenType } from "../../../data/repository/encryption";
import TradeRepository from "../../../data/repository/wallet/trade";
import WalletRepository from "../../../data/repository/wallet/wallet";
import { LimitMarketModel } from "../../../data/repository/database/models/limit";
import { Markup, Telegraf } from "telegraf";
import { MessageTemplete } from "../../../data/handler/template/message";

class OtherService {
  private _userModel: typeof UserModel;
  private _encryptionRepository: EncryptionRepository;
  private bot: Telegraf;

  constructor ({ bot, userModel, tradeRepository, encryptionRepository, walletRepository, limitMarketModel} : {
    bot: Telegraf;
    userModel: typeof UserModel;
    tradeRepository: TradeRepository;
    encryptionRepository: EncryptionRepository;
    walletRepository: WalletRepository;
    limitMarketModel: typeof LimitMarketModel;
  }){
    this.bot = bot;
    this._userModel = userModel;
    this._encryptionRepository = encryptionRepository;
  }

  public addReferralCode = async ({ token, referral_code, }:{
    token: string,
    referral_code: string;
  }) => {
    const decoded: any = this._encryptionRepository.decryptToken(token, TokenType.accessToken);
    if (!decoded?.telegram_id) return { errors: [{ message: 'Invalid request'}] };
    const user = await this._userModel.findOne({ telegram_id: decoded?.telegram_id });
    if (!user) return { errors: [{ message: 'user not found'}] };

    if (user.referal.referalCode === referral_code) {
      return { errors: [{ message: 'you can not refer yourself' }]};
    }

    if (user.referredUserCode) {
      return { errors: [{ message: 'you have already referred this user' }]};
    }
    user.referredUserCode = referral_code;
    user.referal.totalEarnings += 1;
    user.referal.claimableEarnings += 1;

    const updatedUser = await user.save();
    if ( !updatedUser ) {
      return { errors: [{ message: 'Unable to update user referal information' }]};
    }

    const userResponse = await this._userModel.findOne({ "referal.referalCode": referral_code})
    if ( !userResponse ) {
      return { errors: [{ message: 'no user with this referal token' }]};
    }
    userResponse.referal.totalReferrals += 1;
    userResponse.referal.totalEarnings += 1;
    userResponse.referal.claimableEarnings += 1;

    const updatedUserResponse = await userResponse.save();
    if ( !updatedUserResponse ) {
      return { errors: [{ message: 'no user with this referal token' }]};
    }

    try {
      const modifiedKeyboard = Markup.inlineKeyboard([
        Markup.button.callback('🔙 Referal menu', 'refer-friends-and-earn'),
        Markup.button.callback('🔙 Back to menu', 'wallet-menu'),
      ]);

      this.bot.telegram.sendMessage(userResponse.telegram_id, MessageTemplete.defaultMessage(
        "Success! You've earned 1 $GOAT by referring a friend or adding a referral code. Your friend gets 1 $GOAT too. Keep building your $GOAT balance!", user.default_language
      ), modifiedKeyboard, );
      this.bot.telegram.sendMessage(user.telegram_id, MessageTemplete.defaultMessage(
        "You have entered the referral code successfully", user.default_language
      ), modifiedKeyboard);
    }catch{}

    return { message: "updated successfully", };
  };

}

export default OtherService;
