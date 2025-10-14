import React, { useState, useRef, useEffect } from 'react';
import { StatusDisplay } from './StatusDisplay';
import { TracerDisplay } from './TracerDisplay';
import { RecipientTracerDisplay } from './RecipientTracerDisplay';
import { TransactionStatus } from '../types';
import { sendMoney as sendMoneyRandom } from '../services/sendMoneyService';
import { sendMoney as sendMoneyCase1 } from '../cases/send-money-case-1';
import { sendMoney as sendMoneyCase2 } from '../cases/send-money-case-2';
import { sendMoney as sendMoneyCase3 } from '../cases/send-money-case-3';
import { WATCHDOG_TIMEOUT_MS } from '../constants';
import { Account } from '../../App';

interface SendReceiveViewProps {
  accounts: Account[];
  onSendMoneySuccess: (fromId: string, recipient: string, amount: number) => void;
}

type TestCase = 'random' | 'case1' | 'case2' | 'case3';

const caseDetails: { id: TestCase; title: string; description: string }[] = [
  { id: 'random', title: 'Random', description: '25% chance of a slow response (8-10s), 15% chance of failure.' },
  { id: 'case1', title: 'Fast Success', description: 'Guaranteed success in 2 seconds. Watchdog will not trigger.' },
  { id: 'case2', title: 'Slow Success', description: 'Guaranteed success in 9 seconds. Watchdog will trigger.' },
  { id: 'case3', title: 'Slow Failure', description: 'Guaranteed failure in 8 seconds. Watchdog will trigger.' },
];

export const SendReceiveView: React.FC<SendReceiveViewProps> = ({ accounts, onSendMoneySuccess }) => {
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.IDLE);
  const [traceId, setTraceId] = useState<string>('');
  const [transactionAmount, setTransactionAmount] = useState<number>(0);
  const [activeCase, setActiveCase] = useState<TestCase>('random');
  
  const [fromAccount, setFromAccount] = useState(accounts[0]?.id || '');
  const [recipient, setRecipient] = useState('contact@example.com');
  const [amount, setAmount] = useState('50.00');
  const [error, setError] = useState('');
  const [currentRecipient, setCurrentRecipient] = useState('');

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
      setError('Please enter a valid amount.');
      return;
    }
    
    if (!recipient.trim()) {
        setError('Please enter a recipient.');
        return;
    }

    const selectedAccount = accounts.find(acc => acc.id === fromAccount);
    if (!selectedAccount || numericAmount > selectedAccount.balance) {
      setError('Insufficient funds.');
      return;
    }
    
    const newTraceId = crypto.randomUUID();
    setTraceId(newTraceId);
    setTransactionAmount(numericAmount);
    setCurrentRecipient(recipient);
    setStatus(TransactionStatus.PROCESSING);
    wasPending.current = false;

    if (watchdogTimer.current) clearTimeout(watchdogTimer.current);

    watchdogTimer.current = setTimeout(() => {
      wasPending.current = true;
      setStatus(TransactionStatus.PENDING_CONFIRMATION);
    }, WATCHDOG_TIMEOUT_MS);

    let paymentPromise;
    switch (activeCase) {
      case 'case1': paymentPromise = sendMoneyCase1(newTraceId, numericAmount); break;
      case 'case2': paymentPromise = sendMoneyCase2(newTraceId, numericAmount); break;
      case 'case3': paymentPromise = sendMoneyCase3(newTraceId, numericAmount); break;
      default: paymentPromise = sendMoneyRandom(newTraceId, numericAmount);
    }
    
    const result = await paymentPromise;
    if (watchdogTimer.current) clearTimeout(watchdogTimer.current);

    if (result.status === 'SUCCESS') {
      setStatus(wasPending.current ? TransactionStatus.SUCCESS_AFTER_PENDING : TransactionStatus.SUCCESS);
      onSendMoneySuccess(fromAccount, recipient, numericAmount);
    } else {
      setStatus(wasPending.current ? TransactionStatus.FAILED_AFTER_PENDING : TransactionStatus.FAILED);
    }
  };

  const handleReset = () => {
    setStatus(TransactionStatus.IDLE);
    setTraceId('');
    setTransactionAmount(0);
    if (watchdogTimer.current) clearTimeout(watchdogTimer.current);
    wasPending.current = false;
    setAmount('50.00');
    setError('');
  };

  const renderSendForm = () => (
    <form onSubmit={handleFormSubmit} className="space-y-4">
       <div>
        <label htmlFor="fromAccount" className="block text-sm font-medium text-gray-700">From</label>
        <select id="fromAccount" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md">
            {accounts.map(account => (
                <option key={account.id} value={account.id}>{account.name} - {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(account.balance)}</option>
            ))}
        </select>
      </div>
       <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">To (Email or Phone)</label>
          <input type="text" name="recipient" id="recipient" value={recipient} onChange={e => setRecipient(e.target.value)} className="mt-1 focus:ring-red-500 focus:border-red-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
       </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">$</span></div>
          <input type="text" name="amount" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="focus:ring-red-500 focus:border-red-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md" placeholder="0.00" />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">USD</span></div>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Send Money</button>
    </form>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-synovus-dark-gray sm:text-4xl">Send & Receive Money</h1>
        <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">This demonstrates a peer-to-peer payment. The left side is the sender. The right side shows what the recipient sees in real-time, including their own transaction trace.</p>
      </div>
      <fieldset className="bg-white p-4 rounded-lg shadow mb-8">
        <legend className="text-lg font-medium text-synovus-dark-gray mb-2">Select a Test Case</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {caseDetails.map(c => (<div key={c.id} onClick={() => setActiveCase(c.id)} className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${activeCase === c.id ? 'border-synovus-red bg-red-50' : 'border-gray-200 bg-white hover:border-gray-400'}`}><h3 className="font-bold text-gray-800">{c.title}</h3><p className="text-sm text-gray-600 mt-1">{c.description}</p></div>))}
        </div>
      </fieldset>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-xl font-medium text-black mb-4">Sender Terminal</h2>
          {status === TransactionStatus.IDLE ? renderSendForm() : <StatusDisplay status={status} traceId={traceId} onReset={handleReset} />}
        </div>
        <div className="bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-xl font-medium text-black mb-4">Recipient's View</h2>
          <RecipientTracerDisplay status={status} traceId={traceId} amount={transactionAmount} recipientEmail={currentRecipient} />
        </div>
      </div>
    </div>
  );
};
