import { PaymentResult } from '../types.ts';

/**
 * P2P Case 4: Confirmed Slow Failure.
 */
export const sendMoney = (traceId: string, amount: number): Promise<PaymentResult> => {
  console.log(`[Mock BE - P2P Case 4] Received request. Trace ID: ${traceId}, Amount: $${amount}`);
  return new Promise((resolve) => {
    // Random delay between 13.1s and 13.9s, guaranteed to trigger watchdog.
    const delay = Math.random() * 800 + 13100;
    setTimeout(() => {
      console.log(`[Mock BE - P2P Case 4] Responding with FAILED. Trace ID: ${traceId}`);
      resolve({ status: 'FAILED', traceId });
    }, delay);
  });
};
