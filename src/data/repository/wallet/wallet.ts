import Web3 from "web3";
import { IOtherWallet, IWallet } from "../database/models/user";
import jwt from 'jsonwebtoken';
import TradeRepository from "./trade";
export const ANKR_PROVIDER_URL = 'https://rpc.ankr.com/multichain/56ef8dc41ff3a0a8ad5b3247e1cff736b8e0d4c8bfd57aa6dbf43014f5ceae8f';

import { AnkrProvider } from '@ankr.com/ankr.js';
import ICallback from "../../types/callback/callback";

import { ethers, BigNumber, utils } from 'ethers'
import { ERC20ABI } from "./abi/erc20_abi";
const YOUR_ANKR_PROVIDER_URL = 'https://rpc.ankr.com/eth/56ef8dc41ff3a0a8ad5b3247e1cff736b8e0d4c8bfd57aa6dbf43014f5ceae8f'
import axios from 'axios';
const ETHERSCAN_API_KEY = 'XRSGJ71XPY5V7B76ICCSEPPVT9ZVFHXQTN';
   
class WalletRepository {
    private provider: Web3;
    private ankrProvider: AnkrProvider;
    private tradeRepository: TradeRepository;
    etherProvider: ethers.providers.JsonRpcProvider;

    constructor () {
        this.provider = new Web3(new Web3.providers.HttpProvider(YOUR_ANKR_PROVIDER_URL));
        this.ankrProvider = new AnkrProvider(ANKR_PROVIDER_URL);
        this.tradeRepository = new TradeRepository();
        this.etherProvider = new ethers.providers.JsonRpcProvider(YOUR_ANKR_PROVIDER_URL);
    }

    public encryptToken = (data: any) => {
        return jwt.sign(data, process.env.SECRET_ENCRYPTION_KEY!);
    }

    public decryptToken = (data: any): string => {
        return jwt.verify(data, process.env.SECRET_ENCRYPTION_KEY!) as string;
    }

    createWallet:() => Promise<IWallet| undefined> = async () => {
        try {
            const account = this.provider.eth.accounts.create();
            const balance = await this.ankrProvider.getAccountBalance({walletAddress: account.address});

            return {
                address: account.address,
                private_key: this.encryptToken(account.privateKey),
                balance: proximate(balance.assets.find((value) => value.tokenSymbol === "eth")?.balance ?? '0'),
                balance_in_dollar: proximate(balance.assets.find((value) => value.tokenSymbol === "eth")?.balanceUsd ?? '0'),
                others: []
            }
        } catch (err) {
            console.log("Error: ", err);
            return undefined;
        }
    }

    importWallet = async (privateKey: string): Promise<IWallet | undefined> => {
        try {
            const account = this.provider.eth.accounts.privateKeyToAccount(privateKey);
            const balance = await this.ankrProvider.getAccountBalance({walletAddress: account.address});

            return {
                address: account.address,
                private_key: this.encryptToken(account.privateKey),
                balance: proximate(balance.assets.find((value) => value.tokenSymbol === "eth")?.balance ?? '0'),
                balance_in_dollar: proximate(balance.assets.find((value) => value.tokenSymbol === "eth")?.balanceUsd ?? '0'),
                others: []
            }
        } catch (err) {
            return undefined;
        }
    }
      

    getOtherTokens = async (wallet: IWallet): Promise<IOtherWallet[]> => {
        try {
            const tokens = await this.ankrProvider.getAccountBalance({walletAddress: wallet.address, onlyWhitelisted: false});

            return tokens.assets.map((value) => ({
                    logo: value.thumbnail,
                    coin_name: value.tokenName,
                    coin_symbol: value.tokenSymbol,
                    constant_price: value.tokenPrice,
                    decimal: value.tokenDecimals,
                    contract_address: value.contractAddress,
                    balance: proximate(value.balance),
                    balance_in_dollar: proximate(value.balanceUsd)
                })) as IOtherWallet[]
        } catch (err) {
            return [];
        }
    }

    getWallet = async (wallet: IWallet): Promise<IWallet> => {
        try {
            const balance = await this.ankrProvider.getAccountBalance({ walletAddress: wallet.address });

            return {
                address: wallet.address,
                private_key: wallet.private_key,
                balance: proximate(balance.assets.find((value) => value.tokenSymbol === "ETH")?.balance ?? '0'),
                balance_in_dollar: proximate(balance.assets.find((value) => value.tokenSymbol === "ETH")?.balanceUsd ?? '0'),
                others: balance.assets.map((value) => ({
                    logo: value.thumbnail,
                    coin_name: value.tokenName,
                    contract_address: value.contractAddress,
                    constant_price: value.tokenPrice,
                    decimal: value.tokenDecimals,
                    balance: value.balance,
                    balance_in_dollar: value.balanceUsd
                })) as IOtherWallet[]
            }
        } catch (err) {
            return wallet;
        }
    }

    transferToken = async ({wallet, contract_address, reciever_address, amount} : {
        wallet: IWallet,
        contract_address: string,
        reciever_address: string,
        amount: number
    }, callback: (transaction: ICallback) => void) : Promise<{ data?: string; error?: string }> => {
        try {
            console.log(1)
            const privateKey = this.decryptToken(wallet.private_key);
  
            const wallete = new ethers.Wallet(privateKey);
            console.log(2)
            const connectedWallet = wallete.connect(this.etherProvider);

            const erc20Contract = new ethers.Contract(contract_address, ERC20ABI, this.etherProvider);

            const amountSent = ethers.utils.parseUnits(amount.toString(), 18)

            console.log(3)

            const txGasLimit = await this.getGasPrices()
            const low = txGasLimit.gasPrices?.low
            const med = txGasLimit.gasPrices?.average
            const highGas= txGasLimit.gasPrices?.high

            console.log(5)

            const transferToken = await erc20Contract.connect(connectedWallet).transfer(
                reciever_address.trim(),
                amountSent, {
                  gasPrice: ethers.utils.parseUnits(highGas, 'gwei'), // Set your preferred gas price
                  //gasLimit: 300000,
                }
            );
            console.log(6)

            callback({
                transactionHash: transferToken.hash,
                wallet: wallet.address,
                transactionType: 'transfer ERC20',
                amount: amount
            });

            await transferToken.wait()

            console.log(6)

            return { data: transferToken.hash };
        } catch (err) {
            console.log('error', err)
            return { error: 'Error unable process transaction' };
        }
    }

    transferEth = async ({wallet, reciever_address, amount}:{
        wallet: IWallet,
        reciever_address: string,
        amount: number
    }, callback: (transaction: ICallback) => void) : Promise<{ data?: string; error?: string }> => {
        try {
            console.log(1);
            const privateKey = this.decryptToken(wallet.private_key);
  
            const wallete = new ethers.Wallet(privateKey);

            const connectedWallet = wallete.connect(this.etherProvider);

            console.log(2);
            console.log('reciever', reciever_address)

            
            // const nonce = await this.etherProvider.getTransactionCount(wallet.address);

            const txGasLimit = await this.getGasPrices()
            const low = txGasLimit.gasPrices?.low
            const med = txGasLimit.gasPrices?.average
            const highGas= txGasLimit.gasPrices?.high

            const sendEth = await connectedWallet.sendTransaction({
                to: reciever_address.trim(),
                value: ethers.utils.parseEther(amount.toString()), 
                gasPrice: ethers.utils.parseUnits(highGas, 'gwei'),
            })
            

            console.log(3);

            callback({
                transactionHash: sendEth.hash,
                wallet: wallet.address,
                transactionType: 'transfer Eth',
                amount: amount
            });

            console.log(4);

            return { data: sendEth.hash}
        } catch (err) {
            console.log('Error', err)
            return { error: 'Error unable process transaction'};
        }
    }

    addTokensToWallet = async (contract_address: string) => {
        const abiResponse = await this.tradeRepository.getABI(contract_address);
        if (!abiResponse.abi) return { error: abiResponse.error };
    }

    
    getGasPrices = async () => {
        try {
          const response = await axios.get(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`);
          if (response.data.status === "1") {
              return {
                  success: true,
                  gasPrices: {
                      low: response.data.result.SafeGasPrice,
                      average: response.data.result.ProposeGasPrice,
                      high: response.data.result.FastGasPrice
                  }
              };
          } else {
              return { success: false, message: response.data.result };
          }
        } catch (error) {
          console.error('Error fetching gas prices:', error);
          return { success: false, message: 'Error fetching gas prices' };
        }
  
      }
}

export default WalletRepository;

const proximate = (value: string) => {
    return parseFloat(value).toPrecision(5);
};