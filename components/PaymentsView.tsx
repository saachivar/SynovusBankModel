import React, { useState, useRef } from 'react';
import { PaymentForm } from './PaymentForm';
import { StatusDisplay } from './StatusDisplay';
import { TracerDisplay } from './TracerDisplay';
import { TransactionStatus } from '../types';
import { processPayment as processPaymentRandom } from '../services/paymentService';
import { processPayment as processPaymentCase1 } from '../cases/case-1';
import { processPayment as processPaymentCase2 } from '../cases/case-2';
import { processPayment as processPaymentCase3 } from '../cases/case-3';
import { processPayment as processPaymentCase4 } from '../cases/case-4';
import { WATCHDOG_TIMEOUT_MS } from '../constants';

type TestCase = 'random' | 'case1' | 'case2' | 'case3' | 'case4';

const caseDetails: { id: TestCase; title: string; description: string }[] = [
  { id: 'random', title: 'Random', description: '25% chance of a slow response (8-10s), 15% chance of failure.' },
  { id: 'case1', title: 'Fast Success', description: 'Guaranteed success in 2 seconds. Watchdog will not trigger.' },
  { id: 'case2', title: 'Slow Success', description: 'Guaranteed success in 9 seconds. Watchdog will trigger.' },
  { id: 'case3', title: 'Fast Fail', description: 'Guaranteed failure in 0.5 seconds. Watchdog will not trigger.' },
  { id: 'case4', title: 'Slow Fail', description: 'Guaranteed failure in 9 seconds. Watchdog will trigger.' },
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
        paymentPromise = processPaymentCase1(newTrace