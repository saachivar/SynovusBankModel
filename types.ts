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

export type TransactionType = 'PAYMENT' | 'TRANSFER' | 'P2P';

export type TestCase = 'random' | 'case1' | 'case2' | 'case3';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  // New properties to support remediation
  status: 'SUCCESS' | 'FAILED';
  type: TransactionType;
  fromAccountId: string;
  toAccountId?: string;
  recipient?: string;
}

export interface LogEntry {
  timestamp: string;
  source: 'FE' | 'BE';
  message: string;
  traceId?: string;
}