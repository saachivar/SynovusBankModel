import { PaymentResult } from '../types.ts';

/**
 * P2P Case 1: Fast, successful payment.
 */
export const sendMoney = (traceId: string, amount: number): Promise<PaymentResult> => {
  console.log(`[Mock BE - P2P Case 1] Received request. Trace ID: ${traceId}, Amount: $${amount}`);
  return new Promise((resolve) => {
    // 3-4 second delay, well under the 9s watchdog timeout.
    const delay = Math.random() * 1000 + 3000;
    setTimeout(() => {
      console.log(`[Mock BE - P2P Case 1] Responding with SUCCESS. Trace ID: ${traceId}`);
      resolve({ status: 'SUCCESS', traceId });
    }, delay);
  });
};