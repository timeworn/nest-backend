export interface PaystackBankModel {
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: any;
  pay_with_bank: boolean;
  active: boolean;
  is_deleted: boolean;
  country: string;
  currency: string;
  type: string;
  id: number;
  createdAt: string;
  updatedAt: string;
}
