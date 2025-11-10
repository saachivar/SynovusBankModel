import { PaymentResult } from '../types.ts';
import { WATCHDOG_TIMEOUT_MS, LIKELY_TO_FAIL_THRESHOLD_MS } from '../constants.ts';

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

    const random = Math.random();
    let delay;
    let isSuccess = true;

    if (random < 0.65) { // 65% chance of fast success
      // FAST PATH: 1-4 seconds, always success
      delay = Math.random() * 3000 + 1000;
      console.log(`[Mock BE - Transfer] Path: Fast Success. Delay: ${delay.toFixed(0)}ms`);
    } else if (random < 0.85) { // 20% chance of slow success
      // SLOW SUCCESS PATH: Triggers watchdog, but before red threshold. Always success.
      delay = Math.random() * (LIKELY_TO_FAIL_THRESHOLD_MS - WATCHDOG_TIMEOUT_MS - 100) + WATCHDOG_TIMEOUT_MS + 100;
      console.log(`[Mock BE - Transfer] Path: Slow Success. Delay: ${delay.toFixed(0)}ms`);
    } else { // 15% chance of very slow path (potential failure)
      // VERY SLOW PATH: Triggers red threshold, might fail.
      delay = Math.random() * 1000 + LIKELY_TO_FAIL_THRESHOLD_MS;
      isSuccess = Math.random() < 0.6; // If it's very slow, 60% chance of success.
      console.log(`[Mock BE - Transfer] Path: Very Slow (Potential Fail). Delay: ${delay.toFixed(0)}ms. Will succeed: ${isSuccess}`);
    }
    
    setTimeout(() => {
        const status = isSuccess ? 'SUCCESS' : 'FAILED';
        console.log(`[Mock BE] Responding with ${status}. Trace ID: ${traceId}`);
        resolve({ status, traceId });
    }, delay);
  });
};