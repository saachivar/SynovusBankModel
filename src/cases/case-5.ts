import { PaymentResult } from '../types.ts';

/**
 * Case 5: Hidden Success (appears as slow failure).
 * This simulates a scenario where the frontend experiences a timeout and assumes
 * failure, but the backend actually processed the payment successfully.
 * Remediation should uncover the success.
 */
export const processPayment = (traceId: string, amount: number, fromAccountBalance: number): Promise<PaymentResult> => {
  console.log(`[Mock BE - Case 5] Received payment request. Trace ID: ${traceId}, Amount: $${amount}`);

  return new Promise((resolve) => {
    // This delay is very long, ensuring the frontend watchdog triggers and assumes failure.
    // The backend's "true" state is SUCCESS, but it sends a FAILED response to the initial
    // request to simulate a timeout or dropped success message.
    const delay = Math.random() * 800 + 13100;

    setTimeout(() => {
      console.log(`[Mock BE - Case 5] Simulating timeout. Responding with FAILED, but transaction was actually a SUCCESS. Trace ID: ${traceId}`);
      // In a real scenario, the backend would have processed this successfully,
      // but the response to the client might have failed or timed out.
      // We resolve with 'FAILED' to simulate what the client would see.
      resolve({ status: 'FAILED', traceId });
    }, delay);
  });
};
