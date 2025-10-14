export enum TransactionStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING', // Initial state after user clicks pay
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION', // Watchdog triggered, waiting for final backend status
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface PaymentResult {
    status: 'SUCCESS' | 'FAILED';
    traceId: string;
}
