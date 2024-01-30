import { IOtherWallet, IUser, Language } from "../../repository/database/models/user";
import ICallback from "../../types/callback/callback";
import jwt from 'jsonwebtoken';
import { EnglishMessageEarnTemplate, EnglishMessageTemplete } from "./english_message";
import { ModernChineseMessageEarnTemplate, ModernChineseMessageTemplete } from "./modern_chinese_message";
import { TradtionalChineseMessageEarnTemplate } from "./traditional_chinese_message";

const HandleLanguageMessage = (language: Language) => {
    if (language === Language.modern_chinese) EnglishMessageTemplete;
    if (language === Language.modern_chinese) ModernChineseMessageTemplete;
    if (language === Language.traditional_chinese) ModernChineseMessageTemplete;
    return EnglishMessageTemplete;
}

const HandleEarnLanguageMessage = (language: Language) => {
    if (language === Language.modern_chinese) EnglishMessageEarnTemplate;
    if (language === Language.modern_chinese) ModernChineseMessageEarnTemplate;
    if (language === Language.traditional_chinese) TradtionalChineseMessageEarnTemplate;
    return EnglishMessageEarnTemplate;
}

const HandleLanguage = (message: string, language: Language) => {
    if (language === Language.modern_chinese) EnglishMessageEarnTemplate;
    if (language === Language.modern_chinese) ModernChineseMessageEarnTemplate;
    if (language === Language.traditional_chinese) TradtionalChineseMessageEarnTemplate;
    return EnglishMessageEarnTemplate;
}

export class Translate {
    language?: Language;
    constructor(language?: Language) {
        this.language = language;
    }

    changeLanguage = (language?: Language) => {
        this.language = language;
    }

    c = ({en, tch }: { en: string; tch: string }) => {
        switch (this.language) {
            case Language.english:
                return en;
            case Language.traditional_chinese:
                return tch;
            default:
                return en;
        }
    }
}

export abstract class MessageTemplete {
    static decryptToken = (data: any): string => {
        return jwt.verify(data, process.env.SECRET_ENCRYPTION_KEY!) as string;
    }

    static welcome = (language: Language) => HandleLanguageMessage(language).welcome();

    static defaultMessage = (message: string, language: Language) => HandleLanguageMessage(language).defaultMessage(message);

    static generateWalletEntities = (message: string, wallets: IUser['wallets'], language: Language, isTitled = true) => HandleLanguageMessage(language).generateWalletEntities(message, wallets, isTitled);

    static generateExportWalletEntities = ({ wallets }:{ wallets: IUser['wallets']}, language: Language) => HandleLanguageMessage(language).generateExportWalletEntities({ wallets });

    static generateWalletBalanceEntities = (
        { message = "Elevate Your Crypto Trades with GOATBOT– Greatest Of All Telegram Bots",balances }:{ message?: string, balances: IOtherWallet[]}, language: Language
    ) => HandleLanguageMessage(language).generateWalletBalanceEntities({message, balances});

    static buyNotificationMessage = (user: IUser, data: ICallback, language: Language) => HandleLanguageMessage(language).buyNotificationMessage(user, data);
}
export class MessageEarnTemplate {
    static generateReferalMessage = (user: IUser, language: Language) => HandleEarnLanguageMessage(language).generateReferalMessage(user);
}