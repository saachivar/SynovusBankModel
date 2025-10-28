import { PaymentResult } from '../types';

/**
 * Case 3: Pending, failed payment.
 * This simulates a backend that responds with a failure after the watchdog timeout has fired.
 */
export const processPayment = (traceId: string, amount: number, fromAccountBalance: number): Promise<PaymentResult> => {
  console.log(`[Mock BE - Case 3] Received payment request. Trace ID: ${traceId}, Amount: $${amount}`);

  return new Promise((resolve) => {
    // Random delay between 13.1s and 13.9s, guaranteed to trigger both watchdogs.
    const delay = Math.random() * 800 + 13100;

    setTimeout(() => {
      console.log(`[Mock BE - Case 3] Responding with FAILED. Trace ID: ${traceId}`);
      resolve({ status: 'FAILED', traceId });
    }, delay);
  });
};