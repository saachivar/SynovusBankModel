import React, { useState, useRef } from 'react';
import { PaymentForm } from './PaymentForm';
import { StatusDisplay } from './StatusDisplay';
import { TracerDisplay } from './TracerDisplay';
import { TransactionStatus } from '../types';
import { processPayment } from '../services/paymentService';
import { WATCHDOG_TIMEOUT_MS } from '../constants';

export const PaymentsView: React.FC = () => {
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.IDLE);
  const [traceId, setTraceId] = useState<string>('');
  // FIX: Use `ReturnType<typeof setTimeout>` for portable timer ID typing.
  const watchdogTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasPending = useRef<boolean>(false);

  const handlePayment = async (amount: number) => {
    const newTraceId = crypto.randomUUID();
    setTraceId(newTraceId);
    setStatus(TransactionStatus.PROCESSING);
    wasPending.current = false;
    console.log(`[App] Starting payment. Trace ID: ${newTraceId}, Amount: $${amount}`);

    if (watchdogTimer.current) {
      clearTimeout(watchdogTimer.current);
    }

    watchdogTimer.current = setTimeout(() => {
      console.log(`[App] Watchdog triggered. Trace ID: ${newTraceId}`);
      wasPending.current = true;
      setStatus(TransactionStatus.PENDING_CONFIRMATION);
    }, WATCHDOG_TIMEOUT_MS);

    try {
      const result = await processPayment(newTraceId, amount);
      if (watchdogTimer.current) {
        clearTimeout(watchdogTimer.current);
      }
      console.log(`[App] Payment responded. Trace ID: ${result.traceId}, Status: ${result.status}`);
      
      if (wasPending.current) {
        setStatus(result.status === 'SUCCESS' ? TransactionStatus.SUCCESS_AFTER_PENDING : TransactionStatus.FAILED_AFTER_PENDING);
      } else {
        setStatus(result.status === 'SUCCESS' ? TransactionStatus.SUCCESS : TransactionStatus.FAILED);
      }
    } catch (error) {
      if (watchdogTimer.current) {
        clearTimeout(watchdogTimer.current);
      }
      console.error(`[App] Payment failed with an exception. Trace ID: ${newTraceId}`, error);
      setStatus(wasPending.current ? TransactionStatus.FAILED_AFTER_PENDING : TransactionStatus.FAILED);
    }
  };

  const handleReset = () => {
    if (watchdogTimer.current) {
      clearTimeout(watchdogTimer.current);
    }
    setStatus(TransactionStatus.IDLE);
    setTraceId('');
    wasPending.current = false;
    console.log('[App] Resetting payment flow.');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 flex flex-col">
          <div>
            <h1 className="block text-xl leading-tight font-medium text-black">Make a Payment</h1>
            <p className="mt-2 text-gray-500">
              Enter an amount and click pay. The Tracer View on the right will show the transaction's lifecycle.
            </p>
            <div className="mt-6">
              {status === TransactionStatus.IDLE ? (
                <PaymentForm onPay={handlePayment} />
              ) : (
                <StatusDisplay status={status} traceId={traceId} onReset={handleReset} />
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <TracerDisplay status={status} traceId={traceId} />
        </div>
      </div>
    </div>
  );
};