import React, { useState, useRef, useEffect } from 'react';
import { StatusDisplay } from './StatusDisplay';
import { TracerDisplay } from './TracerDisplay';
import { TransactionStatus, TestCase, LogEntry } from '../types';
import { processPayment as processPaymentRandom } from '../services/paymentService';
import { processPayment as processPaymentCase1 } from '../cases/case-1';
import { processPayment as processPaymentCase2 } from '../cases/case-2';
import { processPayment as processPaymentCase3 } from '../cases/case-3';
import { WATCHDOG_TIMEOUT_MS } from '../constants';
import { Account } from '../../App';
import { PaymentForm } from './PaymentForm';
import { EventLog } from './EventLog';

interface PaymentsViewProps {
  accounts: Account[];
  onPaymentComplete: (fromId: string, amount: number, status: 'SUCCESS' | 'FAILED') => void;
}

const caseDetails: { id: TestCase; title: string; description: string }[] = [
  { id: 'random', title: 'Random', description: '25% chance of a slow response (8-10s), 15% chance of failure.' },
  { id: 'case1', title: 'Fast Success', description: 'Guaranteed success in 3-4 seconds. Watchdog will not trigger.' },
  { id: 'case2', title: 'Slow Success', description: 'Guaranteed success between 9-13 seconds. Watchdog will trigger.' },
  { id: 'case3', title: 'Slow Failure', description: 'Guaranteed failure between 13-14 seconds. Both watchdogs will trigger.' },
];

const generateTransactionId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TXN';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const PaymentsView: React.FC<PaymentsViewProps> = ({ accounts, onPaymentComplete }) => {
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.IDLE);
  const [traceId, setTraceId] = useState<string>('');
  const [transactionAmount, setTransactionAmount] = useState<number>(0);
  const [activeCase, setActiveCase] = useState<TestCase>('random');
  const [eventLog, setEventLog] = useState<LogEntry[]>([]);
  const loggedLines = useRef(new Set());
  
  const watchdogTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasPending = useRef<boolean>(false);

  const addLogEntry = (source: 'FE' | 'BE', message: string, traceId?: string) => {
    const newEntry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      source,
      message,
      traceId,
    };
    setEventLog(prev => [...prev, newEntry]);
  };

  const handlePay = async (fromAccountId: string, amount: number) => {
    const selectedAccount = accounts.find(acc => acc.id === fromAccountId);
    if (!selectedAccount) return;

    const newTraceId = crypto.randomUUID();
    setTraceId(newTraceId);
    setTransactionAmount(amount);
    setStatus(TransactionStatus.PROCESSING);
    wasPending.current = false;
    
    loggedLines.current.clear();
    setEventLog([]);
    addLogEntry('FE', `Transaction started. Case: ${activeCase}.`, newTraceId);

    if (watchdogTimer.current) {
      clearTimeout(watchdogTimer.current);
    }

    watchdogTimer.current = setTimeout(() => {
      console.log(`[App] Watchdog triggered. Trace ID: ${newTraceId}`);
      addLogEntry('FE', `Watchdog triggered! UI moved to "Pending".`, newTraceId);
      wasPending.current = true;
      setStatus(TransactionStatus.PENDING_CONFIRMATION);
    }, WATCHDOG_TIMEOUT_MS);

    let paymentPromise;
    const fromBalance = selectedAccount.balance;
    switch (activeCase) {
      case 'case1': paymentPromise = processPaymentCase1(newTraceId, amount, fromBalance); break;
      case 'case2': paymentPromise = processPaymentCase2(newTraceId, amount, fromBalance); break;
      case 'case3': paymentPromise = processPaymentCase3(newTraceId, amount, fromBalance); break;
      default: paymentPromise = processPaymentRandom(newTraceId, amount, fromBalance);
    }
    
    const result = await paymentPromise;

    if (watchdogTimer.current) clearTimeout(watchdogTimer.current);
    
    addLogEntry('BE', `TransactionResponse received. Status: ${result.status === 'SUCCESS' ? 'Success' : 'InternalHostError'}.`, result.traceId);
    console.log(`[App] Received backend response: ${result.status}. Trace ID: ${result.traceId}`);

    if (result.status === 'SUCCESS') {
      const transactionId = generateTransactionId();
      addLogEntry('BE', `TransactionResult: { Status: 'Posted', TransactionId: '${transactionId}' }`);
      const finalStatus = wasPending.current ? TransactionStatus.SUCCESS_AFTER_PENDING : TransactionStatus.SUCCESS;
      setStatus(finalStatus);
      onPaymentComplete(fromAccountId, amount, 'SUCCESS');
    } else {
      const reason = wasPending.current ? 'PaymentProviderError' : 'InvalidRequestData';
      addLogEntry('BE', `TransactionResult: { Status: 'NotPosted', Secondary: '${reason}' }`);
      const finalStatus = wasPending.current ? TransactionStatus.FAILED_AFTER_PENDING : TransactionStatus.FAILED;
      setStatus(finalStatus);
      onPaymentComplete(fromAccountId, amount, 'FAILED');
    }
  };

  const handleTracerLog = (line: number) => {
    if (loggedLines.current.has(line)) return;
    loggedLines.current.add(line);
    const selectedAccount = accounts.find(acc => acc.id === 'checking-1234');

    switch(line) {
      case 2: addLogEntry('FE', 'Building TransactionAddRequest...'); break;
      case 4: addLogEntry('FE', `Set PaymentInfo: { Type: 'C2B', Amount: ${transactionAmount.toFixed(2)} }`); break;
      case 7: addLogEntry('FE', `Watchdog timer armed for ${WATCHDOG_TIMEOUT_MS / 1000}s.`); break;
      case 14: addLogEntry('FE', `Request Sent. MessageID: ${traceId.slice(0,18)}...`, traceId); break;
      case 17: addLogEntry('FE', 'Backend response received. Clearing watchdog.'); break;
      case 21: addLogEntry('FE', 'Processing successful response.'); break;
      case 24: addLogEntry('FE', 'Processing failed response.'); break;
      case 29: addLogEntry('FE', 'Transaction complete. Final status updated.'); break;
    }
  };

  const handleReset = () => {
    setStatus(TransactionStatus.IDLE);
    setTraceId('');
    setTransactionAmount(0);
    if (watchdogTimer.current) clearTimeout(watchdogTimer.current);
    wasPending.current = false;
    setEventLog([]);
    loggedLines.current.clear();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-synovus-dark-gray sm:text-4xl">Bill Payments</h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">This screen demonstrates a tracer-driven watchdog pattern. Slow or failed backend responses are handled gracefully to prevent duplicate payments and keep you informed.</p>
      </div>
      <div className="mb-8">
        <fieldset className="bg-white p-4 rounded-lg shadow">
          <legend className="text-lg font-medium text-synovus-dark-gray mb-2">Select a Backend Response Scenario</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {caseDetails.map((c) => (<div key={c.id} onClick={() => setActiveCase(c.id)} className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${activeCase === c.id ? 'border-synovus-red bg-red-50' : 'border-gray-200 bg-white hover:border-gray-400'}`} role="radio" aria-checked={activeCase === c.id} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setActiveCase(c.id)}><h3 className="font-bold text-gray-800">{c.title}</h3><p className="text-sm text-gray-600 mt-1">{c.description}</p></div>))}
          </div>
        </fieldset>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-xl font-medium text-black mb-4">Payment Terminal</h2>
            {status === TransactionStatus.IDLE ? (<PaymentForm accounts={accounts} onPay={handlePay} />) : (<StatusDisplay status={status} traceId={traceId} onReset={handleReset} />)}
          </div>
          <EventLog logs={eventLog} />
        </div>
        <TracerDisplay status={status} traceId={traceId} amount={transactionAmount} activeCase={activeCase} onLog={handleTracerLog} />
      </div>
    </div>
  );
};