import { Schema, model} from "mongoose";
import { Document, Types, ObjectId } from "mongoose";
import { ISwapTokenInfo } from "../../../types/repository/trade";

export interface ILimit extends Document {
    _id: ObjectId;
    userId: string;
    marketType: string;
    tokenInfo: ISwapTokenInfo;
    amount: number;
    price: number;
    walletAddress: string;
    slippage: number;
    createdAt: Date;
    updatedAt: Date;
}

const LimitSchema = new Schema<ILimit>(
    {
      userId: {
        type: String,
        required: true,
      },
      marketType: {
        type: String,
        enum: ["buy", "sell"],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      walletAddress: {
        type: String,
        required: true,
      },
      tokenInfo: {
        contractAddress: String,
        tokenName: String,
        tokenSymbol: String,
        decimal: Number
      },
      slippage: {
        type: Number,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
);


  
export const LimitMarketModel = model<ILimit>("LimitMarket", LimitSchema);
  