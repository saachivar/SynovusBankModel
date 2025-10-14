import { PaymentResult } from '../types';

/**
 * Case 2: Slow, successful payment.
 * This simulates a backend that responds after the watchdog timeout has fired.
 */
export const processPayment = (traceId: string, amount: number): Promise<PaymentResult> => {
  console.log(`[Mock BE - Case 2] Received payment request. Trace ID: ${traceId}, Amount: $${amount}`);

  return new Promise((resolve) => {
    // 9-second delay, guaranteed to trigger the 7s watchdog.
    const delay = 9000;

    setTimeout(() => {
      console.log(`[Mock BE - Case 2] Responding with SUCCESS. Trace ID: ${traceId}`);
      resolve({ status: 'SUCCESS', traceId });
    }, delay);
  });
};
