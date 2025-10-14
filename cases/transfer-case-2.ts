import { PaymentResult } from '../types';

/**
 * Case 2: Slow, successful transfer.
 * This simulates a backend that responds after the watchdog timeout has fired.
 */
export const processTransfer = (traceId: string, amount: number, fromAccountBalance: number): Promise<PaymentResult> => {
  console.log(`[Mock BE - Transfer Case 2] Received transfer request. Trace ID: ${traceId}, Amount: $${amount}`);

  return new Promise((resolve) => {
    // 9-second delay, guaranteed to trigger the 7s watchdog.
    const delay = 9000;

    setTimeout(() => {
      console.log(`[Mock BE - Transfer Case 2] Responding with SUCCESS. Trace ID: ${traceId}`);
      resolve({ status: 'SUCCESS', traceId });
    }, delay);
  });
};