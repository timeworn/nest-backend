export interface TransactionMetadata {
  recipient: string;
  username: string;
  transactionFee: number;
  transactionMethod: string;
  transactionId: string;
  previousBalance: number;
  currentBalance: number;
  other: any;
}
