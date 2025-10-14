import { PaymentResult } from '../types';

/**
 * Case 1: Fast, successful transfer.
 * This simulates a backend that responds well within the watchdog timeout.
 * It does not check for sufficient funds as it's a guaranteed success case.
 */
export const processTransfer = (traceId: string, amount: number, fromAccountBalance: number): Promise<PaymentResult> => {
  console.log(`[Mock BE - Transfer Case 1] Received transfer request. Trace ID: ${traceId}, Amount: $${amount}`);

  return new Promise((resolve) => {
    // 2-second delay, well under the 7s watchdog timeout.
    const delay = 2000;

    setTimeout(() => {
      console.log(`[Mock BE - Transfer Case 1] Responding with SUCCESS. Trace ID: ${traceId}`);
      resolve({ status: 'SUCCESS', traceId });
    }, delay);
  });
};