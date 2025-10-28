import { PaymentResult } from '../types';

/**
 * Simulates a backend API call for sending money (P2P).
 * This version has a random delay, with a chance of being slow
 * to demonstrate the watchdog functionality.
 */
export const sendMoney = (traceId: string, amount: number): Promise<PaymentResult> => {
  console.log(`[Mock BE - P2P] Received send money request. Trace ID: ${traceId}, Amount: $${amount}`);

  return new Promise((resolve) => {
    const isSlow = Math.random() < 0.25; // 25% chance of a slow response

    if (!isSlow) {
      // FAST PATH: This should always succeed in the P2P random case,
      // as the most common fast-fail reason (insufficient funds) is checked by the client.
      const delay = Math.random() * 3000 + 1000; // 1-4 seconds delay
      setTimeout(() => {
        console.log(`[Mock BE - P2P] Responding with SUCCESS. Trace ID: ${traceId}`);
        resolve({ status: 'SUCCESS', traceId });
      }, delay);
    } else {
      // SLOW PATH: This can still fail due to network timeouts or other backend issues.
      const delay = Math.random() * 2000 + 8000; // 8-10 seconds delay (will trigger watchdog)
      const isSuccess = Math.random() < 0.5; // If it's slow, give it a 50/50 chance of resolving.

      setTimeout(() => {
        if (isSuccess) {
          console.log(`[Mock BE - P2P] Responding with SUCCESS. Trace ID: ${traceId}`);
          resolve({ status: 'SUCCESS', traceId });
        } else {
          console.log(`[Mock BE - P2P] Responding with FAILED. Trace ID: ${traceId}`);
          resolve({ status: 'FAILED', traceId });
        }
      }, delay);
    }
  });
};