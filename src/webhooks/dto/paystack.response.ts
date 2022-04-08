export interface Log {
  start_time: number;
  time_spent: number;
  attempts: number;
  errors: number;
  success: boolean;
  mobile: boolean;
  input: any[];
}

export interface Authorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: true;
  signature: string;
  account_name: string;
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  customer_code: string;
  phone: string;
  metadata: any;
  risk_action: string;
  international_format_phone: string;
}

export interface Plan {}

export interface Subaccount {}

export interface Split {}

export interface Source {
  type: string;
  source: string;
  identifier: string;
}

export interface PaystackData {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message?: any;
  gateway_response: string;
  paid_at: Date;
  created_at: Date;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: string;
  log: Log;
  fees: number;
  fees_split?: any;
  authorization: Authorization;
  customer: Customer;
  plan: Plan;
  subaccount: Subaccount;
  split: Split;
  order_id?: any;
  paidAt: Date;
  requested_amount: number;
  pos_transaction_data?: any;
  source: Source;
}

export interface PaystackResponse {
  event: string;
  data: PaystackData;
  order?: any;
  business_name: string;
}
