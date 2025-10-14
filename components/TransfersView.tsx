import React, { useState, useRef, useEffect } from 'react';
import { StatusDisplay } from './StatusDisplay';
import { TracerDisplay } from './TracerDisplay';
import { TransactionStatus } from '../types';
import { processTransfer as processTransferRandom } from '../services/transferService';
import { processTransfer as processTransferCase1 } from '../cases/transfer-case-1';
import { processTransfer as processTransferCase2 } from '../cases/transfer-case-2';
import { processTransfer as processTransferCase3 } from '../cases/transfer-case-3';
import { WATCHDOG_TIMEOUT_MS } from '../constants';
import { Account } from '../../App'; // Import the shared Account type

interface TransfersViewProps {
    accounts: Account[];
    onTransferSuccess: (fromId: string, toId: string, amount: number) => void;
}

type TestCase = 'random' | 'case1' | 'case2' | 'case3';

const caseDetails: { id: TestCase; title: string; description: string }[] = [
  { id: 'random', title: 'Random', description: '35% chance of a slow response (8-10s), 10% chance of failure.' },
  { id: 'case1', title: 'Fast Success', description: 'Guaranteed success in 2 seconds. Watchdog will not trigger.' },
  { id: 'case2', title: 'Slow Success', description: 'Guaranteed success in 9 seconds. Watchdog will trigger.' },
  { id: 'case3', title: 'Slow Failure', description: 'Guaranteed failure in 8 seconds. Watchdog will trigger.' },
];

export const TransfersView: React.FC<TransfersViewProps> = ({ accounts, onTransferSuccess }) => {
    const [fromAccount, setFromAccount] = useState(accounts[0]?.id || '');
    const [toAccount, setToAccount] = useState(accounts[1]?.id || '');
    const [amount, setAmount] = useState('100.00');
    const [error, setError] = useState('');

    // State for watchdog logic
    const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.IDLE);
    const [traceId, setTraceId] = useState<string>('');
    const [transactionAmount, setTransactionAmount] = useState<number>(0);
    const [activeCase, setActiveCase] = useState<TestCase>('random');
    const watchdogTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wasPending = useRef<boolean>(false);

    // Ensure state is updated if the parent accounts list changes for some reason
    useEffect(() => {
        if (!fromAccount && accounts[0]) setFromAccount(accounts[0].id);
        if (!toAccount && accounts[1]) setToAccount(accounts[1].id);
    }, [accounts, fromAccount, toAccount]);


    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^[0-9]*\.?[0-9]{0,2}$/.test(value)) {
            setAmount(value);
            if (error) setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid amount greater than zero.');
            return;
        }

        if (fromAccount === toAccount) {
            setError('"From" and "To" accounts cannot be the same.');
            return;
        }

        const fromAccountDetails = accounts.find(acc => acc.id === fromAccount);
        if (!fromAccountDetails || numericAmount > fromAccountDetails.balance) {
            setError('Insufficient funds in the selected account.');
            return;
        }

        // Start watchdog process
        const newTraceId = crypto.randomUUID();
        setTraceId(newTraceId);
        setTransactionAmount(numericAmount);
        setStatus(TransactionStatus.PROCESSING);
        wasPending.current = false;
        console.log(`[App] Starting transfer. Case: ${activeCase}. Trace ID: ${newTraceId}, Amount: $${numericAmount}`);

        if (watchdogTimer.current) {
            clearTimeout(watchdogTimer.current);
        }

        watchdogTimer.current = setTimeout(() => {
            console.log(`[App] Watchdog triggered for transfer. Trace ID: ${newTraceId}`);
            wasPending.current = true;
            setStatus(TransactionStatus.PENDING_CONFIRMATION);
        }, WATCHDOG_TIMEOUT_MS);
        
        let transferPromise;
        const fromBalance = fromAccountDetails.balance;
        switch(activeCase) {
            case 'case1':
                transferPromise = processTransferCase1(newTraceId, numericAmount, fromBalance);
                break;
            case 'case2':
                transferPromise = processTransferCase2(newTraceId, numericAmount, fromBalance);
                break;
            case 'case3':
                transferPromise = processTransferCase3(newTraceId, numericAmount, fromBalance);
                break;
            default:
                transferPromise = processTransferRandom(newTraceId, numericAmount, fromBalance);
        }

        const result = await transferPromise;

        if (watchdogTimer.current) {
            clearTimeout(watchdogTimer.current);
        }

        console.log(`[App] Received backend response for transfer: ${result.status}. Trace ID: ${result.traceId}`);

        if (result.status === 'SUCCESS') {
            setStatus(wasPending.current ? TransactionStatus.SUCCESS_AFTER_PENDING : TransactionStatus.SUCCESS);
            // This is the key change: call the parent function to update the app's state
            onTransferSuccess(fromAccount, toAccount, numericAmount);
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
        setAmount('100.00');
        setError('');
    };
    
    const renderTransferForm = () => (
        <form onSubmit={handleSubmit} className="space-y-6">
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
                <label htmlFor="toAccount" className="block text-sm font-medium text-gray-700">To Account</label>
                <select
                    id="toAccount"
                    name="toAccount"
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                >
                    {accounts.map(account => (
                        <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
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
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">USD</span>
                    </div>
                </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            
            <div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Transfer Funds
                </button>
            </div>
        </form>
    );

    return (
        <div className="max-w-7xl mx-auto">
             <div className="text-center mb-12">
                <h1 className="text-3xl font-extrabold text-synovus-dark-gray sm:text-4xl">
                Transfer Funds
                </h1>
                <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                This screen uses the same watchdog pattern to ensure your fund transfers are handled reliably, even with slow network conditions.
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
                    <h2 className="text-xl font-medium text-black mb-4">Transfer Terminal</h2>
                    {status === TransactionStatus.IDLE ? (
                        renderTransferForm()
                    ) : (
                        <StatusDisplay status={status} traceId={traceId} onReset={handleReset} />
                    )}
                </div>
                <TracerDisplay status={status} traceId={traceId} amount={transactionAmount} />
            </div>
        </div>
    );
};