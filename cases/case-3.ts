import { PaymentResult } from '../types';

/**
 * Case 3: Fast, failed payment.
 * This simulates a backend that responds almost instantly with a failure.
 */
export const processPayment = (traceId: string, amount: number): Promise<PaymentResult> => {
  console.log(`[Mock BE - Case 3] Received payment request. Trace ID: ${traceId}, Amount: $${amount}`);

  return new Promise((resolve) => {
    // 500ms delay to simulate a very fast API error response.
    const delay = 500;

    setTimeout(() => {
      console.log(`[Mock BE - Case 3] Responding with FAILED. Trace ID: ${traceId}`);
      resolve({ status: 'FAILED', traceId });
    }, delay);
  });
};