import { PaymentResult } from '../types.ts';

/**
 * P2P Case 5: Hidden Success (appears as slow failure).
 */
export const sendMoney = (traceId: string, amount: number): Promise<PaymentResult> => {
  console.log(`[Mock BE - P2P Case 5] Received request. Trace ID: ${traceId}, Amount: $${amount}`);
  return new Promise((resolve) => {
    // This delay is very long, ensuring the frontend watchdog triggers and assumes failure.
    // The backend's "true" state is SUCCESS, but it sends a FAILED response to the initial
    // request to simulate a timeout or dropped success message.
    const delay = Math.random() * 800 + 13100;
    setTimeout(() => {
      console.log(`[Mock BE - P2P Case 5] Simulating timeout. Responding with FAILED, but tx was SUCCESS. Trace ID: ${traceId}`);
      resolve({ status: 'FAILED', traceId });
    }, delay);
  });
};
