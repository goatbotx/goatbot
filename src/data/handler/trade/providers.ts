import { BaseProvider } from '@ethersproject/providers'
import { BigNumber, ethers, providers } from 'ethers'

import { CurrentConfig, Environment } from './config'

// Single copies of provider and wallet
const mainnetProvider = new ethers.providers.JsonRpcProvider(
  CurrentConfig.rpc.mainnet
)
const wallet = createWallet()

// Interfaces

export enum TransactionState {
  Failed = 'Failed',
  New = 'New',
  Rejected = 'Rejected',
  Sending = 'Sending',
  Sent = 'Sent',
}

// Provider and Wallet Functions


export function getProvider(): providers.Provider | null {
  return wallet.provider
}

function createWallet(): ethers.Wallet {
  let provider = mainnetProvider
  if (CurrentConfig.env == Environment.LOCAL) {
    provider = new ethers.providers.JsonRpcProvider(CurrentConfig.rpc.local)
  }
  return new ethers.Wallet(CurrentConfig.wallet.privateKey, provider)
}
