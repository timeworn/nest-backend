export enum ReferralTaskStatus {
  Active = 'Active',
  Expired = 'Expired',
  Cancelled = 'Cancelled',
  Pending = 'Pending',
}

export enum ReferralTaskCancelledAction {
  DisburseFunds = 'disburse_funds',
  Cancel = 'cancel',
}
