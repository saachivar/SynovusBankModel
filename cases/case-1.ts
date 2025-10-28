import { PaymentResult } from '../types';

/**
 * Case 1: Fast, successful payment.
 * This simulates a backend that responds well within the watchdog timeout.
 */
export const processPayment = (traceId: string, amount: number, fromAccountBalance: number): Promise<PaymentResult> => {
  console.log(`[Mock BE - Case 1] Received payment request. Trace ID: ${traceId}, Amount: $${amount}`);

  return new Promise((resolve) => {
    // 3-4 second delay, well under the 9s watchdog timeout.
    const delay = Math.random() * 1000 + 3000;

    setTimeout(() => {
      console.log(`[Mock BE - Case 1] Responding with SUCCESS. Trace ID: ${traceId}`);
      resolve({ status: 'SUCCESS', traceId });
    }, delay);
  });
};