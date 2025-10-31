import { PaymentResult } from '../types.ts';

/**
 * Transfer Case 4: Confirmed Slow Failure.
 * Simulates a backend that fails after a long delay, triggering the watchdog.
 * Remediation should confirm the failure.
 */
export const processTransfer = (traceId: string, amount: number, fromAccountBalance: number): Promise<PaymentResult> => {
  console.log(`[Mock BE - Transfer Case 4] Received transfer request. Trace ID: ${traceId}, Amount: $${amount}`);

  return new Promise((resolve) => {
    // Random delay between 13.1s and 13.9s, guaranteed to trigger watchdog.
    const delay = Math.random() * 800 + 13100;

    setTimeout(() => {
      console.log(`[Mock BE - Transfer Case 4] Responding with FAILED. Trace ID: ${traceId}`);
      resolve({ status: 'FAILED', traceId });
    }, delay);
  });
};
