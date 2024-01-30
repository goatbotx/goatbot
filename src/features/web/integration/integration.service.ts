import { UserModel } from "../../../data/repository/database/models/user";
import EncryptionRepository, { TokenType } from "../../../data/repository/encryption";
import TradeRepository from "../../../data/repository/wallet/trade";
import WalletRepository from "../../../data/repository/wallet/wallet";
import IError from "../../../data/types/error/error";
import { LimitMarketModel } from "../../../data/repository/database/models/limit";
import { ISwapTokenInfo } from "../../../data/types/repository/trade";
import { Markup, Telegraf } from "telegraf";
import { MessageTemplete } from "../../../data/handler/template/message";

class IntegrationService {
  private _userModel: typeof UserModel;
  private _tradeRepository: TradeRepository;
  private _walletRepository: WalletRepository;
  private _encryptionRepository: EncryptionRepository;
  private _limitMarketModel: typeof LimitMarketModel;
  private telegrambot: Telegraf;

  constructor ({ bot, userModel, tradeRepository, encryptionRepository, walletRepository, limitMarketModel} : {
    bot: Telegraf;
    userModel: typeof UserModel;
    tradeRepository: TradeRepository;
    encryptionRepository: EncryptionRepository;
    walletRepository: WalletRepository;
    limitMarketModel: typeof LimitMarketModel;
  }){
    this.telegrambot = bot;
    this._userModel = userModel;
    this._tradeRepository = tradeRepository;
    this._encryptionRepository = encryptionRepository;
    this._walletRepository = walletRepository;
    this._limitMarketModel = limitMarketModel;

  }

  public getGasPrices = async () => {
    const gasPricesResponse = await this._tradeRepository.getGasPrices();
    if ( !gasPricesResponse.success || !gasPricesResponse.gasPrices ) {
      return { errors: 'unable to get gas prices' };
    } 
    return { data: gasPricesResponse.gasPrices };
  };

  public getListOfTokensInWallet = async ({ token } : { token: string}): Promise<{ errors?: IError[], data?: any[] }> => {
    const decoded: any = this._encryptionRepository.decryptToken(token, TokenType.accessToken);
    if (!decoded?.telegram_id) return { errors: [{ message: 'Invalid request'}] };

    const user = await this._userModel.findOne({ telegram_id: decoded.telegram_id });
    if (!user) return { errors: [{ message: 'unable to get user information' }]};

    const wallet = user.wallets.find(_wallet => _wallet.address === decoded.wallet_address)
    if (!wallet) return { errors: [{ message: 'unable to get this wallet information' }]};

    const tokensResponse = await this._tradeRepository.getOtherTokens(wallet);
    console.log(tokensResponse);

    if ( !tokensResponse ) {
      return { errors: [{ message: 'unable to get list of token' }]};
    } 
    return { data: tokensResponse };
  };

  public getCoinByContractAddress = async ({ contract_address }:{
    contract_address: string,
  }) => {
    const response = await this._tradeRepository.getCoinByContractAddress({ contract_address });
    if ( !response ) {
      return { errors: [{ message: 'unable to place trade' }]};
    }

    return { response };
  };

  public buyCoin = async ({ token, tokenInfo, amount, slippage, gas_fee, }:{
    token: string,
    tokenInfo: ISwapTokenInfo,
    slippage: number;
    amount: number
    gas_fee: number
  }) => {
    const decoded: any = this._encryptionRepository.decryptToken(token, TokenType.accessToken);
    if (!decoded?.telegram_id) return { errors: [{ message: 'Invalid request'}] };
    const user = await this._userModel.findOne({ telegram_id: decoded?.telegram_id });
    if (!user) return { errors: [{ message: 'user not found'}] };

    const wallet = user.wallets.find((wallet) => wallet.address === decoded.wallet_address);
    console.log(tokenInfo)
    console.log(user.wallets)
    if (!wallet) return { errors: [{ message: 'unable to get wallet information' }]};

    const response = await this._tradeRepository.swapEthToToken({ tokenInfo, amount, slippage, wallet, gas_fee }, (data) => {
      this.telegrambot.telegram.sendMessage(user.telegram_id, MessageTemplete.buyNotificationMessage(user, data, user.default_language), Markup.inlineKeyboard([
        [ Markup.button.callback('🔙 Back', 'menu') ],
      ]));
    });
    console.log()
    if ( !response ) {
      return { errors: [{ message: 'unable to place trade' }]};
    }

    return { response };
  };

  public sellCoin = async ({ token, tokenInfo, amount, slippage, gas_fee, }:{
    token: string,
    tokenInfo: ISwapTokenInfo,
    slippage: number;
    amount: number
    gas_fee: number
  }) => {
    const decoded: any = this._encryptionRepository.decryptToken(token, TokenType.accessToken);
    if (!decoded?.telegram_id) return { errors: [{ message: 'Invalid request'}] };
    const user = await this._userModel.findOne({ telegram_id: decoded?.telegram_id });
    if (!user) return { errors: [{ message: 'user not found'}] };

    const wallet = user.wallets.find((wallet) => wallet.address === decoded.wallet_address);
    console.log(tokenInfo)
    console.log(user.wallets)
    if (!wallet) return { errors: [{ message: 'unable to get wallet information' }]};

    const response = await this._tradeRepository.swapTokenToEth({ tokenInfo, amount, slippage, wallet, gas_fee }, (data) => {
      this.telegrambot.telegram.sendMessage(user.telegram_id, MessageTemplete.buyNotificationMessage(user, data, user.default_language), Markup.inlineKeyboard([
        [ Markup.button.callback('🔙 Back', 'menu') ],
      ]));
    });

    if ( !response ) {
      return { errors: [{ message: 'unable to place trade' }]};
    }

    return { response };
  };

  public marketSwapCoin = async ({ token, tokenInfoIn, tokenInfoOut, amount, slippage, gas_fee, }:{
    token: string,
    tokenInfoIn: ISwapTokenInfo,
    tokenInfoOut: ISwapTokenInfo,
    slippage: number;
    amount: number
    gas_fee: number
  }) => {
    const decoded: any = this._encryptionRepository.decryptToken(token, TokenType.accessToken);
    if (!decoded?.telegram_id) return { errors: [{ message: 'Invalid request'}] };
    const user = await this._userModel.findOne({ telegram_id: decoded?.telegram_id });
    if (!user) return { errors: [{ message: 'user not found'}] };

    const wallet = user.wallets.find((wallet) => wallet.address === decoded.wallet_address);
    console.log('token In',tokenInfoIn)
    console.log('token Out',tokenInfoOut)
    if (!wallet) return { errors: [{ message: 'unable to get wallet information' }]};

    if (tokenInfoIn.contractAddress === tokenInfoOut.contractAddress) {
      return { errors: [{ message: 'cannot swap between two similar token' }]};
    }

    let response;


    console.log("wallet test: ", wallet)

    if (!tokenInfoIn.contractAddress || tokenInfoIn.contractAddress === 'eth') {
      response = await this._tradeRepository.swapEthToToken({ tokenInfo: tokenInfoOut, amount, slippage, wallet, gas_fee }, (data) => {
        this.telegrambot.telegram.sendMessage(user.telegram_id, MessageTemplete.buyNotificationMessage(user, data, user.default_language), Markup.inlineKeyboard([
          [ Markup.button.callback('🔙 Back', 'menu') ],
        ]));
      });
    } else
    if (!tokenInfoOut.contractAddress || tokenInfoOut.contractAddress === 'eth') {
      response = await this._tradeRepository.swapTokenToEth({ tokenInfo: tokenInfoIn, amount, slippage, wallet, gas_fee }, (data) => {
        this.telegrambot.telegram.sendMessage(user.telegram_id, MessageTemplete.buyNotificationMessage(user, data, user.default_language), Markup.inlineKeyboard([
          [ Markup.button.callback('🔙 Back', 'menu') ],
        ]));
      });
    } else {
      response = await this._tradeRepository.swapGen({ tokenInfoIn, tokenInfoOut, amount, slippage, wallet, gas_fee }, (data) => {
        this.telegrambot.telegram.sendMessage(user.telegram_id, MessageTemplete.buyNotificationMessage(user, data, user.default_language), Markup.inlineKeyboard([
          [ Markup.button.callback('🔙 Back', 'menu') ],
        ]));
      });
    }

    if ( !response ) {
      return { errors: [{ message: 'unable to place trade' }]};
    }
    return { response };
  };

  public limitBuy = async ({ token, marketType, tokenInfo, amount, slippage, price }:{
    token: string,
    marketType: string,
    slippage: number;
    tokenInfo: ISwapTokenInfo,
    amount: number
    price: number,
  }) => {
    const decoded: any = this._encryptionRepository.decryptToken(token, TokenType.accessToken);
    if (!decoded?.telegram_id) return { errors: [{ message: 'Invalid request'}] };
      const user = await this._userModel.findOne({ telegram_id: decoded.telegram_id});
      if (!user) return { errors: [{ message: 'user not found'}] };

      const wallet = user.wallets.find((wallet) => wallet.address === decoded.wallet_address);
      if (!wallet) return { error: [{ message: 'unable to get wallet information' }]};

      const newLimitBuy = await this._limitMarketModel.create({
        userId: decoded?.telegram_id,
        marketType,
        tokenInfo,
        price,
        amount,
        slippage,
        walletAddress: decoded.wallet_address
      })

      return { limitBuy: newLimitBuy };
  };


  public limitSell = async ({ token, marketType, tokenInfo, amount, slippage, price }:{
    token: string,
    marketType: string,
    slippage: number;
    tokenInfo: ISwapTokenInfo,
    amount: number
    price: number,
  }) => {
      const decoded: any = this._encryptionRepository.decryptToken(token, TokenType.accessToken);
      if (!decoded?.telegram_id) return { errors: [{ message: 'Invalid request'}] };
      
      const user = await this._userModel.findOne({ telegram_id: decoded?.telegram_id});
      if (!user) return { errors: [{ message: 'user not found'}] };

      const wallet = user.wallets.find((wallet) => wallet.address === decoded.wallet_address);
      if (!wallet) return { error: [{ message: 'unable to get wallet information' }]};

      const newLimitBuy = await this._limitMarketModel.create({
        userId: decoded?.telegram_id,
        marketType,
        tokenInfo,
        price,
        amount,
        slippage,
        walletAddress: decoded.wallet_address
      })

      return { limitBuy: newLimitBuy };
  };


  public importWallet = async ({ token, private_key }:{
    token: string,
    private_key: string,
  }) => {
      const decoded: any = this._encryptionRepository.decryptToken(token, TokenType.accessToken);
      if (!decoded?.telegram_id) return { errors: [{ message: 'Invalid request'}] };

      const user = await this._userModel.findOne({ telegram_id: decoded.telegram_id });
      if (!user) return { errors: [{ message: 'user not found'}] };

      if (user.wallets.find((wallet) => wallet?.private_key === private_key)) {
        return { errors: [{ message: 'This wallet is already imported'}] };
      }

      if (user.wallets.length > 2) {
        return { errors: [{ message: 'Remove one wallet to add this wallet'}] };
      }

      const wallet = await this._walletRepository.importWallet(private_key);
      if (!wallet) return { errors: [{ message: 'invalid private key' }]};
      user.wallets.push(wallet)
      await user.save();

      return { data: "Successfully updated" }
  };

  public transferToken = async ({ token, amount, contract_address, reciever_address }:{
    token: string,
    contract_address: string,
    reciever_address: string
    amount: number,
  }) => {
      const decoded: any = this._encryptionRepository.decryptToken(token, TokenType.accessToken);
      if (!decoded?.telegram_id) return { errors: [{ message: 'Invalid request'}] };
      if (!decoded?.wallet_address) return { errors: [{ message: 'Invalid request'}] };

      const user = await this._userModel.findOne({ telegram_id: decoded.telegram_id });
      if (!user) return { errors: [{ message: 'user not found'}] };

      const wallet = user.wallets.find((value) => value.address === decoded?.wallet_address);
      if (!wallet) return { errors: [{ message: 'wallet not found'}] };

      if ( contract_address === "eth") {
        const transaction = await this._walletRepository.transferEth({ wallet, amount, reciever_address }, (data) => {
          this.telegrambot.telegram.sendMessage(user.telegram_id, MessageTemplete.buyNotificationMessage(user, data, user.default_language));
        });
        if (!transaction.data) return { errors: [{ message: transaction.error ?? 'wallet not found'}] };
      } else {
        const transaction = await this._walletRepository.transferToken({ wallet, amount, contract_address, reciever_address }, (data) => {
          this.telegrambot.telegram.sendMessage(
            user.telegram_id,
            MessageTemplete.buyNotificationMessage(user, data, user.default_language),
            Markup.inlineKeyboard([
              [ Markup.button.callback('🔙 Back', 'menu') ],
            ])
          );
        });
        if (!transaction.data) return { errors: [{ message: transaction.error ?? 'wallet not found'}] };
      }

      return { data: "transaction" }
  };

  public transferEth = async ({ token, amount, reciever_address }:{
    token: string,
    reciever_address: string
    amount: number,
  }) => {
      const decoded: any = this._encryptionRepository.decryptToken(token, TokenType.accessToken);
      if (!decoded?.telegram_id) return { errors: [{ message: 'Invalid request'}] };
      if (!decoded?.wallet_address) return { errors: [{ message: 'Invalid request'}] };

      const user = await this._userModel.findOne({ telegram_id: decoded.telegram_id });
      if (!user) return { errors: [{ message: 'user not found'}] };

      const wallet = user.wallets.find((value) => value.address === decoded?.wallet_address);
      if (!wallet) return { errors: [{ message: 'wallet not found'}] };

      const transaction = await this._walletRepository.transferEth({ wallet, amount, reciever_address }, (data) => {
        this.telegrambot.telegram.sendMessage(
          user.telegram_id,
          MessageTemplete.buyNotificationMessage(user, data, user.default_language),
          Markup.inlineKeyboard([
            [ Markup.button.callback('🔙 Back', 'menu') ],
          ])
        );
      });
      if (!transaction.data) return { errors: [{ message: transaction.error ?? 'wallet not found'}] };

      return { data: transaction }
  };

  public getBalance = async (token: string) => {
      const decoded: any = this._encryptionRepository.decryptToken(token, TokenType.accessToken);

      if (!decoded?.telegram_id) return { errors: [{ message: 'Unable to load wallet'}] };
      if (!decoded?.wallet_address) return { errors: [{ message: 'Unable to load wallet'}] };

      const user = await this._userModel.findOne({ telegram_id: decoded.telegram_id });
      if (!user) return { errors: [{ message: 'user not found'}] };

      const wallet = user.wallets.find((value) => value.address === decoded?.wallet_address);

      if (!wallet) return { errors: [{ message: 'wallet not found'}] };

      const balances = await this._tradeRepository.getOtherTokens(wallet);
      return { data: balances };
  };

}

export default IntegrationService;
