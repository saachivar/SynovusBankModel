import { PaymentResult } from '../types.ts';
import { WATCHDOG_TIMEOUT_MS, LIKELY_TO_FAIL_THRESHOLD_MS } from '../constants.ts';

/**
 * Simulates a backend API call for payment processing.
 * This version has a random delay, with a chance of being slow
 * to demonstrate the watchdog functionality.
 */
export const processPayment = (traceId: string, amount: number, fromAccountBalance: number): Promise<PaymentResult> => {
  console.log(`[Mock BE] Received payment request. Trace ID: ${traceId}, Amount: $${amount}`);

  return new Promise((resolve) => {
    // Simulate an immediate backend validation for funds
    if (amount > fromAccountBalance) {
        console.log(`[Mock BE] Responding with FAILED (Insufficient Funds). Trace ID: ${traceId}`);
        resolve({ status: 'FAILED', traceId });
        return;
    }

    const random = Math.random();
    let delay;
    let isSuccess = true;

    if (random < 0.75) { // 75% chance of fast success
      // FAST PATH: 1-4 seconds, always success
      delay = Math.random() * 3000 + 1000;
      console.log(`[Mock BE] Path: Fast Success. Delay: ${delay.toFixed(0)}ms`);
    } else if (random < 0.90) { // 15% chance of slow success
      // SLOW SUCCESS PATH: Triggers watchdog, but before red threshold. Always success.
      delay = Math.random() * (LIKELY_TO_FAIL_THRESHOLD_MS - WATCHDOG_TIMEOUT_MS - 100) + WATCHDOG_TIMEOUT_MS + 100;
      console.log(`[Mock BE] Path: Slow Success. Delay: ${delay.toFixed(0)}ms`);
    } else { // 10% chance of very slow path (potential failure)
      // VERY SLOW PATH: Triggers red threshold, might fail.
      delay = Math.random() * 1000 + LIKELY_TO_FAIL_THRESHOLD_MS;
      isSuccess = Math.random() < 0.4; // 40% chance of success if very slow
      console.log(`[Mock BE] Path: Very Slow (Potential Fail). Delay: ${delay.toFixed(0)}ms. Will succeed: ${isSuccess}`);
    }

    setTimeout(() => {
        const status = isSuccess ? 'SUCCESS' : 'FAILED';
        console.log(`[Mock BE] Responding with ${status}. Trace ID: ${traceId}`);
        resolve({ status, traceId });
    }, delay);
  });
};