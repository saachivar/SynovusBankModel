import { PaymentResult } from '../types';

/**
 * P2P Case 3: Slow, failed payment.
 */
export const sendMoney = (traceId: string, amount: number): Promise<PaymentResult> => {
  console.log(`[Mock BE - P2P Case 3] Received request. Trace ID: ${traceId}, Amount: $${amount}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[Mock BE - P2P Case 3] Responding with FAILED. Trace ID: ${traceId}`);
      resolve({ status: 'FAILED', traceId });
    }, 8000);
  });
};
