import { PaymentResult } from '../types';

/**
 * Simulates a backend API call for payment processing.
 * This function introduces random delays and outcomes to mimic various real-world scenarios.
 *
 * Scenarios are now balanced with a 25% chance for each:
 * 1. FAST_SUCCESS: Responds successfully before the watchdog timeout.
 * 2. SLOW_SUCCESS: Responds successfully after the watchdog timeout, causing a PENDING state first.
 * 3. FAST_FAILURE: Responds with a failure before the watchdog timeout.
 * 4. SLOW_FAILURE: Responds with a failure after the watchdog timeout, causing a PENDING state first.
 */
export const processPayment = (traceId: string, amount: number): Promise<PaymentResult> => {
  console.log(`[Mock BE] Received payment request. Trace ID: ${traceId}, Amount: $${amount}`);

  return new Promise((resolve, reject) => {
    const scenario = Math.random();
    let delay: number;

    // Scenario 1: FAST_SUCCESS (25% chance)
    if (scenario < 0.25) {
      delay = Math.random() * 3000 + 2000; // 2-5 seconds
      console.log(`[Mock BE] Scenario: FAST_SUCCESS. Responding in ${delay.toFixed(0)}ms. Trace ID: ${traceId}`);
      setTimeout(() => {
        console.log(`[Mock BE] Responding with SUCCESS. Trace ID: ${traceId}`);
        resolve({ status: 'SUCCESS', traceId });
      }, delay);
    } 
    // Scenario 2: SLOW_SUCCESS (25% chance)
    else if (scenario < 0.5) {
      delay = Math.random() * 2000 + 11000; // 11-13 seconds
      console.log(`[Mock BE] Scenario: SLOW_SUCCESS. Responding in ${delay.toFixed(0)}ms. Trace ID: ${traceId}`);
      setTimeout(() => {
        console.log(`[Mock BE] Responding with SUCCESS. Trace ID: ${traceId}`);
        resolve({ status: 'SUCCESS', traceId });
      }, delay);
    }
    // Scenario 3: FAST_FAILURE (25% chance)
    else if (scenario < 0.75) {
      delay = Math.random() * 3000 + 2000; // 2-5 seconds
      console.log(`[Mock BE] Scenario: FAST_FAILURE. Responding in ${delay.toFixed(0)}ms. Trace ID: ${traceId}`);
      setTimeout(() => {
        console.log(`[Mock BE] Responding with FAILED. Trace ID: ${traceId}`);
        resolve({ status: 'FAILED', traceId });
      }, delay);
    }
    // Scenario 4: SLOW_FAILURE (25% chance)
    else {
      delay = Math.random() * 2000 + 11000; // 11-13 seconds
      console.log(`[Mock BE] Scenario: SLOW_FAILURE. Responding in ${delay.toFixed(0)}ms. Trace ID: ${traceId}`);
      setTimeout(() => {
        console.log(`[Mock BE] Responding with FAILED. Trace ID: ${traceId}`);
        resolve({ status: 'FAILED', traceId });
      }, delay);
    }
  });
};