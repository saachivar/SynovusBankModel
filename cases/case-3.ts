import { PaymentResult } from '../types';

/**
 * Case 3: Pending, failed payment.
 * This simulates a backend that responds with a failure after the watchdog timeout has fired.
 */
export const processPayment = (traceId: string, amount: number): Promise<PaymentResult> => {
  console.log(`[Mock BE - Case 3] Received payment request. Trace ID: ${traceId}, Amount: $${amount}`);

  return new Promise((resolve) => {
    // 8-second delay, guaranteed to trigger the 7s watchdog.
    const delay = 8000;

    setTimeout(() => {
      console.log(`[Mock BE - Case 3] Responding with FAILED. Trace ID: ${traceId}`);
      resolve({ status: 'FAILED', traceId });
    }, delay);
  });
};
