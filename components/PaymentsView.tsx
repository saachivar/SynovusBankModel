import React, { useState, useRef } from 'react';
import { PaymentForm } from './PaymentForm';
import { StatusDisplay } from './StatusDisplay';
import { TracerDisplay } from './TracerDisplay';
import { TransactionStatus } from '../types';
import { processPayment as processPaymentRandom } from '../services/paymentService';
import { processPayment as processPaymentCase1 } from '../cases/case-1';
import { processPayment as processPaymentCase2 } from '../cases/case-2';
import { processPayment as processPaymentCase3 } from '../cases/case-3';
import { WATCHDOG_TIMEOUT_MS } from '../constants';

type TestCase = 'random' | 'case1' | 'case2' | 'case3';

const caseDetails: { id: TestCase; title: string; description: string }[] = [
  { id: 'random', title: 'Random', description: '25% chance of a slow response (8-10s), 15% chance of failure.' },
  { id: 'case1', title: 'Fast Success', description: 'Guaranteed success in 2 seconds. Watchdog will not trigger.' },
  { id: 'case2', title: 'Slow Success', description: 'Guaranteed success in 9 seconds. Watchdog will trigger.' },
  { id: 'case3', title: 'Pending Fail', description: 'Guaranteed failure in 8 seconds. Watchdog will trigger.' },
];

export const PaymentsView: React.FC = () => {
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.IDLE);
  const [traceId, setTraceId] = useState<string>('');
  const [activeCase, setActiveCase] = useState<TestCase>('random');
  // FIX: Use `ReturnType<typeof setTimeout>` for portable timer ID typing.
  const watchdogTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasPending = useRef<boolean>(false);

  const handlePayment = async (amount: number) => {
    const newTraceId = crypto.randomUUID();
    setTraceId(newTraceId);
    setStatus(TransactionStatus.PROCESSING);
    wasPending.current = false;
    console.log(`[App] Starting payment. Case: ${activeCase}. Trace ID: ${newTraceId}, Amount: $${amount}`);

    if (watchdogTimer.current) {
      clearTimeout(watchdogTimer.current);
    }

    watchdogTimer.current = setTimeout(() => {
      console.log(`[App] Watchdog triggered. Trace ID: ${newTraceId}`);
      wasPending.current = true;
      setStatus(TransactionStatus.PENDING_CONFIRMATION);
    }, WATCHDOG_TIMEOUT_MS);

    let paymentPromise;
    switch (activeCase) {
      case 'case1':
        paymentPromise = processPaymentCase1(newTraceId, amount);
        break;
      case 'case2':
        paymentPromise = processPaymentCase2(newTraceId, amount);
        break;
      case 'case3':
        paymentPromise = processPaymentCase3(newTraceId, amount);
        break;
      default:
        paymentPromise = processPaymentRandom(newTraceId, amount);
    }
    
    const result = await paymentPromise;

    if (watchdogTimer.current) {
      clearTimeout(watchdogTimer.current);
    }

    console.log(`[App] Received backend response: ${result.status}. Trace ID: ${result.traceId}`);

    if (result.status === 'SUCCESS') {
      setStatus(wasPending.current ? TransactionStatus.SUCCESS_AFTER_PENDING : TransactionStatus.SUCCESS);
    } else {
      setStatus(wasPending.current ? TransactionStatus.FAILED_AFTER_PENDING : TransactionStatus.FAILED);
    }
  };

  const handleReset = () => {
    setStatus(TransactionStatus.IDLE);
    setTraceId('');
    if (watchdogTimer.current) {
      clearTimeout(watchdogTimer.current);
    }
    wasPending.current = false;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-synovus-dark-gray sm:text-4xl">
          Tracer-Driven Watchdog Demo
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          This demo shows how a frontend can use a "watchdog" timer, driven by OpenTelemetry-style tracing, to gracefully handle slow backend responses without causing duplicate transactions.
        </p>
      </div>

      <div className="mb-8">
        <fieldset className="bg-white p-4 rounded-lg shadow">
          <legend className="text-lg font-medium text-synovus-dark-gray mb-2">Select a Test Case</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {caseDetails.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveCase(c.id)}
                className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${
                  activeCase === c.id ? 'border-synovus-red bg-red-50' : 'border-gray-200 bg-white hover:border-gray-400'
                }`}
              >
                <h3 className="font-bold text-gray-800">{c.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{c.description}</p>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-xl font-medium text-black mb-4">Payment Terminal</h2>
          {status === TransactionStatus.IDLE ? (
            <PaymentForm onPay={handlePayment} />
          ) : (
            <StatusDisplay status={status} traceId={traceId} onReset={handleReset} />
          )}
        </div>
        <TracerDisplay status={status} traceId={traceId} />
      </div>
    </div>
  );
};