import React, { useState, useRef, useEffect } from 'react';
import { StatusDisplay } from './StatusDisplay';
import { TracerDisplay } from './TracerDisplay';
import { TransactionStatus } from '../types';
import { processPayment as processPaymentRandom } from '../services/paymentService';
import { processPayment as processPaymentCase1 } from '../cases/case-1';
import { processPayment as processPaymentCase2 } from '../cases/case-2';
import { processPayment as processPaymentCase3 } from '../cases/case-3';
import { WATCHDOG_TIMEOUT_MS } from '../constants';
import { Account } from '../../App';

interface PaymentsViewProps {
  accounts: Account[];
  onPaymentComplete: (fromId: string, amount: number, status: 'SUCCESS' | 'FAILED') => void;
}

type TestCase = 'random' | 'case1' | 'case2' | 'case3';

const caseDetails: { id: TestCase; title: string; description: string }[] = [
  { id: 'random', title: 'Random', description: '25% chance of a slow response (8-10s), 15% chance of failure.' },
  { id: 'case1', title: 'Fast Success', description: 'Guaranteed success in 2 seconds. Watchdog will not trigger.' },
  { id: 'case2', title: 'Slow Success', description: 'Guaranteed success in 9 seconds. Watchdog will trigger.' },
  { id: 'case3', title: 'Slow Failure', description: 'Guaranteed failure in 8 seconds. Watchdog will trigger.' },
];

export const PaymentsView: React.FC<PaymentsViewProps> = ({ accounts, onPaymentComplete }) => {
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.IDLE);
  const [traceId, setTraceId] = useState<string>('');
  const [transactionAmount, setTransactionAmount] = useState<number>(0);
  const [activeCase, setActiveCase] = useState<TestCase>('random');
  
  // Form state
  const [fromAccount, setFromAccount] = useState(accounts[0]?.id || '');
  const [amount, setAmount] = useState('25.00');
  const [error, setError] = useState('');

  const watchdogTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasPending = useRef<boolean>(false);

  useEffect(() => {
    if (!fromAccount && accounts[0]) {
      setFromAccount(accounts[0].id);
    }
  }, [accounts, fromAccount]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }
    
    const selectedAccount = accounts.find(acc => acc.id === fromAccount);
    if (!selectedAccount || numericAmount > selectedAccount.balance) {
      setError('Insufficient funds for this payment.');
      return;
    }
    
    // Start payment process
    const newTraceId = crypto.randomUUID();
    setTraceId(newTraceId);
    setTransactionAmount(numericAmount);
    setStatus(TransactionStatus.PROCESSING);
    wasPending.current = false;
    console.log(`[App] Starting payment. Case: ${activeCase}. Trace ID: ${newTraceId}, Amount: $${numericAmount}`);

    if (watchdogTimer.current) {
      clearTimeout(watchdogTimer.current);
    }

    watchdogTimer.current = setTimeout(() => {
      console.log(`[App] Watchdog triggered. Trace ID: ${newTraceId}`);
      wasPending.current = true;
      setStatus(TransactionStatus.PENDING_CONFIRMATION);
    }, WATCHDOG_TIMEOUT_MS);

    let paymentPromise;
    const fromBalance = selectedAccount.balance;
    switch (activeCase) {
      case 'case1':
        paymentPromise = processPaymentCase1(newTraceId, numericAmount, fromBalance);
        break;
      case 'case2':
        paymentPromise = processPaymentCase2(newTraceId, numericAmount, fromBalance);
        break;
      case 'case3':
        paymentPromise = processPaymentCase3(newTraceId, numericAmount, fromBalance);
        break;
      default:
        paymentPromise = processPaymentRandom(newTraceId, numericAmount, fromBalance);
    }
    
    const result = await paymentPromise;

    if (watchdogTimer.current) {
      clearTimeout(watchdogTimer.current);
    }

    console.log(`[App] Received backend response: ${result.status}. Trace ID: ${result.traceId}`);

    if (result.status === 'SUCCESS') {
      setStatus(wasPending.current ? TransactionStatus.SUCCESS_AFTER_PENDING : TransactionStatus.SUCCESS);
      onPaymentComplete(fromAccount, numericAmount, 'SUCCESS');
    } else {
      setStatus(wasPending.current ? TransactionStatus.FAILED_AFTER_PENDING : TransactionStatus.FAILED);
      onPaymentComplete(fromAccount, numericAmount, 'FAILED');
    }
  };

  const handleReset = () => {
    setStatus(TransactionStatus.IDLE);
    setTraceId('');
    setTransactionAmount(0);
    if (watchdogTimer.current) {
      clearTimeout(watchdogTimer