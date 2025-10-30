// types.ts

export enum TransactionStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING', 
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

export type TransactionType = 'PAYMENT' | 'TRANSFER' | 'P2P' | 'REQUEST_SENT' | 'SPLIT_SENT';

export type TestCase = 'random' | 'case1' | 'case2' | 'case3';

export interface Recipient {
    id: string;
    name: string;
    contact: string;
    initials: string;
}

export interface Transaction {
  id: string;
  timestamp: string; // Changed from 'date' to 'timestamp'
  description: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  type: TransactionType;
  fromAccountId?: string;
  toAccountId?: string;
  recipient?: Recipient; // For P2P and Requests
  participants?: Recipient[]; // For Splits
  wasPending?: boolean;
  remediationAttempted?: boolean;
  reason?: string;
  expires?: string; // For pending requests/splits
}

export interface LogEntry {
  timestamp: string;
  source: 'FE' | 'BE';
  message: string;
  traceId?: string;
}

export type Tab = 'ACCOUNTS' | 'PAYMENTS' | 'TRANSFERS' | 'INSIGHTS' | 'PLANNING' | 'FAQS_SUPPORT';

export interface Account {
  id: string;
  name: string;
  balance: number;
}