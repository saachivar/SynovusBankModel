import { PaymentResult } from '../types';

/**
 * Simulates a backend API call for payment processing.
 * This version has a random delay, with a chance of being slow
 * to demonstrate the watchdog functionality.
 */
export const processPayment = (traceId: string, amount: number): Promise<PaymentResult> => {
  console.log(`[Mock BE] Received payment request. Trace ID: ${traceId}, Amount: $${amount}`);

  return new Promise((resolve) => {
    const isSlow = Math.random() < 0.25; // 25% chance of a slow response
    const delay = isSlow
      ? Math.random() * 2000 + 8000 // 8-10 seconds delay (will trigger watchdog)
      : Math.random() * 3000 + 1000; // 1-4 seconds delay (won't trigger watchdog)

    const isSuccess = Math.random() < 0.85; // 85% chance of success overall

    setTimeout(() => {
      if (isSuccess) {
        console.log(`[Mock BE] Responding with SUCCESS. Trace ID: ${traceId}`);
        resolve({ status: 'SUCCESS', traceId });
      } else {
        console.log(`[Mock BE] Responding with FAILED. Trace ID: ${traceId}`);
        resolve({ status: 'FAILED', traceId });
      }
    }, delay);
  });
};