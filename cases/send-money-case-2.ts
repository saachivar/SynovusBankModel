import { PaymentResult } from '../types';

/**
 * P2P Case 2: Slow, successful payment.
 */
export const sendMoney = (traceId: string, amount: number): Promise<PaymentResult> => {
  console.log(`[Mock BE - P2P Case 2] Received request. Trace ID: ${traceId}, Amount: $${amount}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[Mock BE - P2P Case 2] Responding with SUCCESS. Trace ID: ${traceId}`);
      resolve({ status: 'SUCCESS', traceId });
    }, 9000);
  });
};
