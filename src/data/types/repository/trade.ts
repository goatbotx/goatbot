import { Token, TradeType } from "@uniswap/sdk-core";
import { Trade } from "@uniswap/v3-sdk";

export type TokenTrade = Trade<Token, Token, TradeType>

export type TokenResponseType = {
  blockNumber: string,
  timeStamp: string,
  hash: string,
  nonce: string,
  blockHash: string,
  from: string,
  contractAddress: string,
  to: string,
  value: string,
  tokenName: string,
  tokenSymbol: string,
  tokenDecimal: string,
  transactionIndex: string,
  gas: string,
  gasPrice: string,
  gasUsed: string,
  cumulativeGasUsed: string,
  input: string,
  confirmations: string
}

export interface PoolInfo {
  token0: string;
  token1: string;
  fee: number;
  tickSpacing: number;
  sqrtPriceX96: any;
  liquidity: any;
  tick: number;
}

export interface ISwapTokenInfo {
  contractAddress: string;
  tokenName: string;
  tokenSymbol: string;
  decimal: number
}