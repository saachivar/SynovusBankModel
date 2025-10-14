export enum TransactionStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING', // Initial state after user clicks pay
  // FIX: Add PENDING_CONFIRMATION to the enum to resolve compilation errors.
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  SUCCESS_AFTER_PENDING = 'SUCCESS_AFTER_PENDING',
  FAILED_AFTER_PENDING = 'FAILED_AFTER_PENDING',
}

export interface PaymentResult {
    status: 'SUCCESS' | 'FAILED';
    traceId: string;
}