export interface FormerUserModel {
  id: string;
  country_id: any;
  email: string;
  fcm_token: string;
  first_name: string;
  last_name: string;
  password: string;
  phone_number: string;
  referral_code: string;
  role_id: string;
  verification_code: string;
  phone_verified_at: string;
  token: string;
  expiry: string;
  status: string;
  employer_id: string;
  updated_at: string;
  created_at: string;
  coin_balance: number;
  products: FormerProductModel[];
  transactions: FormerTransactionModel[];
  profiles: FormerProfileModel[];
}

export interface FormerProductModel {
  id: string;
  category_id: string;
  price: any;
  offering: string;
  description: string;
  transaction_type?: string;
  status: string;
  user_id: string;
  location: FormerLocationModel;
  is_active: number;
  type: string;
  updated_at: string;
  created_at: string;
  search_response_id?: string;
}

export interface FormerLocationModel {
  coordinates: number[];
  type: string;
}

export interface FormerTransactionModel {
  id: string;
  payment_id: string;
  user_id: string;
  type: string;
  amount: number;
  coin: number;
  title: string;
  description: string;
  invoice_number: string;
  status: string;
  state: string;
  updated_at: string;
  created_at: string;
  with_user_id?: string;
  transaction_id?: string;
  opportunity_id?: string;
}

export interface FormerProfileModel {
  id: string;
  gender: string;
  occupation: string;
  occupation_status: string;
  user_id: string;
  updated_at: string;
  created_at: string;
  image: string;
}

export interface FormerRoleModel {
  id: string;
  name: string;
  display_name: string;
  updated_at: string;
  created_at: string;
}

export interface FormerCategoryModel {
  id: string;
  name: string;
  display_image: string;
  is_active: number;
  updated_at: string;
  created_at: string;
}

export interface FormerResultModel {
  roles: FormerRoleModel[];
  categories: FormerCategoryModel[];
}

export interface FormerDataModel {
  result: FormerResultModel;
  parsedUsers: FormerUserModel[];
}
