import { Schema, model, PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IOtherWallet {
    logo: string;
    coin_name: string;
    coin_symbol: string;
    decimal: number;
    contract_address: string;
    balance_in_dollar: string;
    balance: string;
    constant_price?: string;
}

export interface IWallet {
    private_key: string;
    address: string;
    seed_phrase?: string;
    public_key?: string;
    balance_in_dollar: string;
    balance: string;
    others: IOtherWallet[]
}

export enum Language {
    english = 'Engish',
    traditional_chinese = 'Traditional Chinese',
    modern_chinese = 'Modern Chinese',
}

export interface IUser {
    _id?: string;
    name?: string;
    telegram_id: string;
    wallets: IWallet[],
    referredUserCode?: string;
    referal: {
        referalCode: string;
        totalReferrals: number;
        totalEarnings: number;
        totalGoatHeld: number;
        claimableEarnings: number;
    };
    passcode?: string;
    default_language: Language;
    previous_command: string;
}


const OtherWalletSchema = new Schema<IOtherWallet>({
    coin_name: {
        type: String,
    },
    contract_address: {
        type: String,
    },
})

const WalletSchema = new Schema<IWallet>({
    private_key: {
        type: String,
    },
    address: {
        type: String,
    },
    seed_phrase: {
        type: String,
    },
    public_key: {
        type: String,
    },
    others: {
        type: [OtherWalletSchema],
        default: []
    }
})

const UserSchema = new Schema<IUser>({
    name: {
        type: String,
    },
    telegram_id: {
        type: String,
    },
    wallets: [WalletSchema],
    referredUserCode: String,
    referal: {
        referalCode: String,
        totalReferrals: Number,
        totalEarnings: Number,
        claimableEarnings: Number,
        totalGoatHeld: Number,
    },
    default_language: {
        type: String,
        default: Language.english,
        enum: Object.values(Language),
    },
    passcode: {
        type: String,
    },
    previous_command: {
        type: String,
    }
});

UserSchema.plugin(mongoosePaginate);

export const UserModel = model<IUser, PaginateModel<IUser>>("User", UserSchema);
