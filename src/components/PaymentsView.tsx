// components/PaymentsView.tsx

import React, { useState, useRef, useEffect } from 'react';
import { StatusDisplay } from './StatusDisplay.tsx';
import { TracerDisplay } from './TracerDisplay.tsx';
import { EventLog } from './EventLog.tsx';
import { TransactionStatus, PaymentResult, TestCase, LogEntry, Transaction, Account } from '../types.ts';
import { processPayment as processPaymentRandom } from '../services/paymentService.ts';
import { processPayment as processPaymentCase1 } from '../cases/case-1.ts';
import { processPayment as processPaymentCase2 } from '../cases/case-2.ts';
import { processPayment as processPaymentCase3 } from '../cases/case-3.ts';
import { processPayment as processPaymentCase4 } from '../cases/case-4.ts';
import { processPayment as processPaymentCase5 } from '../cases/case-5.ts';
import { WATCHDOG_TIMEOUT_MS } from '../constants.ts';
import { PaymentForm } from './PaymentForm.tsx';
import { RemediationControl } from './RemediationControl.tsx';

interface PaymentsViewProps {
    accounts: Account[];
    onPaymentComplete: (fromId: string, payee: string, amount: number, status: 'SUCCESS' | 'FAILED', wasPending: boolean, trueStatus?: 'SUCCESS' | 'FAILED') => Transaction;
    onRemediate: (transactionId: string) => void;
}

const caseDetails: { id: TestCase; title: string; description: string }[] = [
  { id: 'random', title: 'Random', description: '25% chance of slow response (8-10s), 15% chance of failure.' },
  { id: 'case1', title: 'Fast Success', description: 'Guaranteed success in 3-4 seconds. Watchdog will not trigger.' },
  { id: 'case2', title: 'Slow Success', description: 'Guaranteed success between 9-13 seconds. Watchdog will trigger.' },
  { id: 'case3', title: 'Slow Failure', description: 'Guaranteed failure > 13s. Remediation confirms failure.' },
  { id: 'case4', title: 'Confirmed Fail', description: 'Guaranteed failure > 13s. Remediation confirms failure.'},
  { id: 'case5', title: 'Hidden Success', description: 'Appears to fail > 13s, but remediation finds it was a success.' },
];

export const PaymentsView: React.FC<PaymentsViewProps> = ({ accounts, onPaymentComplete, onRemediate }) => {
    const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.IDLE);
    const [traceId, setTraceId] = useState<string>('');
    const [transactionAmount, setTransactionAmount] = useState<number>(0);
    const [activeCase, setActiveCase] = useState<TestCase>('random');
    const [eventLog, setEventLog] = useState<LogEntry[]>([]);
    const [currentPayee, setCurrentPayee] = useState('City Power & Light');
    const [remediableTx, setRemediableTx] = useState<Transaction | null>(null);

    const watchdogTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wasPending = useRef<boolean>(false);
    const loggedLines = useRef(new Set());
    
    const addLogEntry = (source: 'FE' | 'BE', message: string, traceId?: string) => {
        setEventLog(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), source, message, traceId }]);
    };

    const handleRemediate = (transactionId: string) => {
        onRemediate(transactionId);
        setRemediableTx(null);
    };

    const handlePay = async (fromId: string, amount: number) => {
        const selectedAccount = accounts.find(acc => acc.id === fromId);
        if (!selectedAccount) return;

        const newTraceId = crypto.randomUUID();
        setTraceId(newTraceId);
        setTransactionAmount(amount);
        setStatus(TransactionStatus.PROCESSING);
        wasPending.current = false;
        loggedLines.current.clear();
        setEventLog([]);
        setRemediableTx(null);
        addLogEntry('FE', `Bill payment started. Case: ${activeCase}.`, newTraceId);

        if (watchdogTimer.current) clearTimeout(watchdogTimer.current);

        watchdogTimer.current = setTimeout(() => {
            wasPending.current = true;
            addLogEntry('FE', `Watchdog triggered! UI moved to "Pending".`, newTraceId);
            setStatus(TransactionStatus.PENDING_CONFIRMATION);
        }, WATCHDOG_TIMEOUT_MS);
        
        let paymentPromise: Promise<PaymentResult>;
        switch(activeCase) {
            case 'case1': paymentPromise = processPaymentCase1(newTraceId, amount, selectedAccount.balance); break;
            case 'case2': paymentPromise = processPaymentCase2(newTraceId, amount, selectedAccount.balance); break;
            case 'case3': paymentPromise = processPaymentCase3(newTraceId, amount, selectedAccount.balance); break;
            case 'case4': paymentPromise = processPaymentCase4(newTraceId, amount, selectedAccount.balance); break;
            case 'case5': paymentPromise = processPaymentCase5(newTraceId, amount, selectedAccount.balance); break;
            default: paymentPromise = processPaymentRandom(newTraceId, amount, selectedAccount.balance);
        }

        const result = await paymentPromise;
        if (watchdogTimer.current) clearTimeout(watchdogTimer.current);

        addLogEntry('BE', `TransactionResponse received. Status: ${result.status === 'SUCCESS' ? 'Success' : 'InternalHostError'}.`, result.traceId);

        if (result.status === 'SUCCESS') {
            setStatus(wasPending.current ? TransactionStatus.SUCCESS_AFTER_PENDING : TransactionStatus.SUCCESS);
            onPaymentComplete(fromId, currentPayee, amount, 'SUCCESS', wasPending.current);
        } else {
            setStatus(wasPending.current ? TransactionStatus.FAILED_AFTER_PENDING : TransactionStatus.FAILED);
            const trueStatus = activeCase === 'case5' ? 'SUCCESS' : 'FAILED';
            const newTransaction = onPaymentComplete(fromId, currentPayee, amount, 'FAILED', wasPending.current, trueStatus);
            // Any failure that was pending OR is the special hidden success case can be remediated
            if (newTransaction.wasPending || activeCase === 'case5') {
                setRemediableTx(newTransaction);
            }
        }
    };
    
    const handleTracerLog = (line: number) => {
        if (loggedLines.current.has(line)) return;
        loggedLines.current.add(line);
        switch(line) {
          case 2: addLogEntry('FE', 'Building TransactionAddRequest...'); break;
          case 4: addLogEntry('FE', `Set PaymentInfo: { Amount: ${transactionAmount.toFixed(2)} }`); break;
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
        setRemediableTx(null);
    };

    return (
        <div className="max-w-7xl mx-auto bg-white p-6 md:p-8 shadow-md rounded-lg">
            <fieldset className="bg-gray-50 p-4 rounded-lg shadow-inner border mb-8">
                <legend className="text-lg font-medium text-synovus-dark-gray mb-2 px-2">Select a Test Case</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {caseDetails.map(c => (
                        <div key={c.id} onClick={() => setActiveCase(c.id)} className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${activeCase === c.id ? 'border-synovus-red bg-red-50' : 'border-gray-200 bg-white hover:border-gray-400'}`} role="radio" aria-checked={activeCase === c.id} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setActiveCase(c.id)}>
                            <h3 className="font-bold text-gray-800">{c.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                        </div>
                    ))}
                </div>
            </fieldset>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="flex flex-col gap-8">
                    <div className="bg-gray-50 p-8 rounded-xl shadow-inner border">
                        <h2 className="text-xl font-medium text-black mb-4">Payment Terminal</h2>
                        {status === TransactionStatus.IDLE 
                            ? <PaymentForm accounts={accounts} onPay={handlePay} />
                            : <StatusDisplay status={status} traceId={traceId} onReset={handleReset} />
                        }
                    </div>
                    <EventLog logs={eventLog} />
                </div>
                <div className="flex flex-col gap-6">
                    <TracerDisplay status={status} traceId={traceId} amount={transactionAmount} activeCase={activeCase} onLog={handleTracerLog} />
                    <RemediationControl remediableTx={remediableTx} onRemediate={handleRemediate} />
                </div>
            </div>
        </div>
    );
};