import { BadRequestException, Injectable } from '@nestjs/common';
import { AppConstants } from '../../constants';
import axios from 'axios';
import { CreateTransferRecipientDto, InitializeTransactionDto, MakeTransferDto, VerifyAccountDto } from '.';
import { PaystackBankModel } from './models/paystack_bank.model';

const baseUrl = AppConstants.PAYSTACK_API_URL;
const apiKey = AppConstants.PAYSTACK_API_KEY;

const http = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
});

@Injectable()
export class PaystackService {
  async verifyAccount(verifyAccountDto: VerifyAccountDto) {
    const { accountNumber, bankCode } = verifyAccountDto;
    try {
      const response = await http.get(`bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`);
      return response.data;
    } catch (error) {
      throw new BadRequestException(`Account not valid`);
    }
  }

  async createTransferRecipient(createTransferRecipientDto: CreateTransferRecipientDto) {
    const { bankCode, accountNumber } = createTransferRecipientDto;
    const account = await this.verifyAccount(createTransferRecipientDto);

    const response = await http.post(`transferrecipient`, {
      type: 'nuban',
      name: account.data.account_name,
      account_number: account.data.account_number,
      bank_code: bankCode,
      currency: 'NGN',
    });

    const transferRecipient = response.data.data;

    return {
      accountNumber,
      bankCode,
      bankName: transferRecipient.details.bank_name,
      bankId: account.data.bank_id,
      accountName: account.data.account_name,
      recipientCode: transferRecipient.recipient_code,
    };
  }

  async initializeTransaction(initializeTransactionDto: InitializeTransactionDto) {
    const response = await http.post(`transaction/initialize`, {
      ...initializeTransactionDto,
      amount: initializeTransactionDto.amount * 100,
    });

    return response.data.data;
  }

  async makeTransfer(makeTransferDto: MakeTransferDto) {
    const response = await http.post(`transfer`, {
      ...makeTransferDto,
      amount: Number(makeTransferDto.amount) * 100,
      source: 'balance',
      reason: 'SpottR Payout',
    });
    return response.data;
  }

  async getBanks(): Promise<PaystackBankModel[]> {
    const response = await http.get('bank');
    return response.data.data;
  }
}
