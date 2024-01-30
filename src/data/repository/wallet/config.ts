import { ChainId, Token } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'

export const WETH_TOKEN = new Token(
    ChainId.MAINNET,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    18,
    'WETH',
    'Wrapped Ether'
  )
  
  export const USDC_TOKEN = new Token(
    ChainId.MAINNET,
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    6,
    'USDC',
    'USD//C'
  )

export const WETH_TOKEN_TEST = new Token(
    ChainId.GOERLI,
    '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
    18,
    'WETH',
    'Wrapped Ether'
  )
  
  export const USDC_TOKEN_TEST = new Token(
    ChainId.GOERLI,
    '0x0d6B12630Db150559822bb5297227C107332A8bf',
    6,
    'USDC',
    'USD//C'
  )

// Sets if the example should run locally or on chain
export enum Environment {
  LOCAL,
  MAINNET,
  TESTNET,
  WALLET_EXTENSION,
}

// Inputs that configure this example to run
export interface ExampleConfig {
  env: Environment
  rpc: {
    local: string
    // mainnet: string
  }
  wallet: {
    address: string
    privateKey: string
  }
  tokens: {
    in: Token
    amountIn: number
    out: Token
    poolFee: number
  }
}

// Example Configuration

export const CurrentConfig: ExampleConfig = {
  env: Environment.TESTNET,
  rpc: {
    local: 'http://localhost:8545',
    // mainnet: '',
  },
  wallet: {
    address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    privateKey:
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  },
  tokens: {
    in: WETH_TOKEN,
    amountIn: 1,
    out: USDC_TOKEN,
    poolFee: FeeAmount.MEDIUM,
  },
}