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
  onPaymentSuccess: (fromId: string, amount: number) => void;
}

type TestCase = 'random' | 'case1' | 'case2' | 'case3';

const caseDetails: { id: TestCase; title: string; description: string }[] = [
  { id: 'random', title: 'Random', description: '25% chance of a slow response (8-10s), 15% chance of failure.' },
  { id: 'case1', title: 'Fast Success', description: 'Guaranteed success in 2 seconds. Watchdog will not trigger.' },
  { id: 'case2', title: 'Slow Success', description: 'Guaranteed success in 9 seconds. Watchdog will trigger.' },
  { id: 'case3', title: 'Slow Failure', description: 'Guaranteed failure in 8 seconds. Watchdog will trigger.' },
];

export const PaymentsView: React.FC<PaymentsViewProps> = ({ accounts, onPaymentSuccess }) => {
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
      onPaymentSuccess(fromAccount, numericAmount);
    } else {
      setStatus(wasPending.current ? TransactionStatus.FAILED_AFTER_PENDING : TransactionStatus.FAILED);
    }
  };

  const handleReset = () => {
    setStatus(TransactionStatus.IDLE);
    setTraceId('');
    setTransactionAmount(0);
    if (watchdogTimer.current) {
      clearTimeout(watchdogTimer.current);
    }
    wasPending.current = false;
    setAmount('25.00');
    setError('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]*\.?[0-9]{0,2}$/.test(value)) {
      setAmount(value);
      if (error) setError('');
    }
  };

  const renderPaymentForm = () => (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div>
        <label htmlFor="fromAccount" className="block text-sm font-medium text-gray-700">From Account</label>
        <select
            id="fromAccount"
            name="fromAccount"
            value={fromAccount}
            onChange={(e) => setFromAccount(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
        >
            {accounts.map(account => (
                <option key={account.id} value={account.id}>{account.name} - {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(account.balance)}</option>
            ))}
        </select>
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Payment Amount
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="text"
            name="amount"
            id="amount"
            className="focus:ring-red-500 focus:border-red-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
            placeholder="0.00"
            value={amount}
            onChange={handleAmountChange}
            aria-describedby="amount-currency"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm" id="amount-currency">
              USD
            </span>
          </div>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Pay Now
        </button>
      </div>
    </form>
  );

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
            renderPaymentForm()
          ) : (
            <StatusDisplay status={status} traceId={traceId} onReset={handleReset} />
          )}
        </div>
        <TracerDisplay status={status} traceId={traceId} amount={transactionAmount} />
      </div>
    </div>
  );
};