import { PaymentResult } from '../types.ts';

/**
 * P2P Case 2: Slow, successful payment.
 */
export const sendMoney = (traceId: string, amount: number): Promise<PaymentResult> => {
  console.log(`[Mock BE - P2P Case 2] Received request. Trace ID: ${traceId}, Amount: $${amount}`);
  return new Promise((resolve) => {
    // Random delay between 9.1s and 12.9s, guaranteed to trigger the 9s watchdog but finish before 13s.
    const delay = Math.random() * 3800 + 9100;
    setTimeout(() => {
      console.log(`[Mock BE - P2P Case 2] Responding with SUCCESS. Trace ID: ${traceId}`);
      resolve({ status: 'SUCCESS', traceId });
    }, delay);
  });
};