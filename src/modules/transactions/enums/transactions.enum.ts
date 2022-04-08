export enum TransactionOperations {
  COIN_PURCHASE = 'coin_purchase',
  CREDIT = 'credit',
  DEBIT = 'debit',
  WITHDRAWAL = 'withdrawal',
  PRODUCT_PURCHASE = 'product_purchase',
}

export enum TransactionTypes {
  WALLET_TRANSACTION = 'wallet_transaction',
  PAYMENT_TRANSACTION = 'payment_transaction',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESSFUL = 'successful',
  CANCELLED = 'cancelled',
}
