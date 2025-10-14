import { PaymentResult } from '../types';

/**
 * Case 3: Slow, failed transfer.
 * This simulates a backend that responds with a failure after the watchdog timeout has fired.
 */
export const processTransfer = (traceId: string, amount: number, fromAccountBalance: number): Promise<PaymentResult> => {
  console.log(`[Mock BE - Transfer Case 3] Received transfer request. Trace ID: ${traceId}, Amount: $${amount}`);

  return new Promise((resolve) => {
    // 8-second delay, guaranteed to trigger the 7s watchdog.
    const delay = 8000;

    setTimeout(() => {
      console.log(`[Mock BE - Transfer Case 3] Responding with FAILED. Trace ID: ${traceId}`);
      resolve({ status: 'FAILED', traceId });
    }, delay);
  });
};