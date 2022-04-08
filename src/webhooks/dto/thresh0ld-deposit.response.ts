export interface Addon {
  address_label: string;
  aml_screen_pass: boolean;
  fee_decimal: number;
}

export interface Thresh0ldDepositResponse {
  type: number;
  serial: number;
  order_id: string;
  currency: string;
  txid: string;
  block_height: number;
  tindex: number;
  vout_index: number;
  amount: string;
  fees: string;
  memo: string;
  broadcast_at: number;
  chain_at: number;
  from_address: string;
  to_address: string;
  wallet_id: number;
  state: number;
  confirm_blocks: number;
  processing_state: number;
  addon: Addon;
  decimal: number;
  currency_bip44: number;
  token_address: string;
}
