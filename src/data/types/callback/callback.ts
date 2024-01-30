interface ICallback {
    transactionHash: string;
    wallet: string;
    transactionType: string | any;
    amount: number;
  }
  
  export default ICallback;