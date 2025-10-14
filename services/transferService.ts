import { PaymentResult } from '../types';

/**
 * Simulates a backend API call for fund transfers.
 * It first checks for sufficient funds, then introduces a
 * random delay to demonstrate the watchdog functionality.
 */
export const processTransfer = (traceId: string, amount: number, fromAccountBalance: number): Promise<PaymentResult> => {
  console.log(`[Mock BE] Received transfer request. Trace ID: ${traceId}, Amount: $${amount}`);

  return new Promise((resolve) => {
    // Simulate an immediate backend validation for funds
    if (amount > fromAccountBalance) {
      console.log(`[Mock BE] Responding with FAILED (Insufficient Funds). Trace ID: ${traceId}`);
      // No delay for this type of validation failure
      resolve({ status: 'FAILED', traceId });
      return;
    }

    // If funds are sufficient, proceed with simulated network/processing delay
    const isSlow = Math.random() < 0.35; // 35% chance of a slow response
    const delay = isSlow
      ? Math.random() * 2000 + 8000 // 8-10 seconds delay (will trigger watchdog)
      : Math.random() * 3000 + 1000; // 1-4 seconds delay (won't trigger watchdog)

    const isSuccess = Math.random() < 0.90; // 90% chance of success if funds are sufficient

    setTimeout(() => {
      if (isSuccess) {
        console.log(`[Mock BE] Responding with SUCCESS. Trace ID: ${traceId}`);
        resolve({ status: 'SUCCESS', traceId });
      } else {
        console.log(`[Mock BE] Responding with FAILED (Processing Error). Trace ID: ${traceId}`);
        resolve({ status: 'FAILED', traceId });
      }
    }, delay);
  });
};