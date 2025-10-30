// components/SendReceiveView.tsx

import React, { useState, useRef, useEffect } from 'react';
import { StatusDisplay } from './StatusDisplay.tsx';
import { TracerDisplay } from './TracerDisplay.tsx';
import { RecipientTracerDisplay } from './RecipientTracerDisplay.tsx';
import { EventLog } from './EventLog.tsx';
import { TransactionStatus, PaymentResult, TestCase, LogEntry, Recipient, Transaction, Account } from '../types.ts';
import { sendMoney as sendMoneyRandom } from '../services/sendMoneyService.ts';
import { sendMoney as sendMoneyCase1 } from '../cases/send-money-case-1.ts';
import { sendMoney as sendMoneyCase2 } from '../cases/send-money-case-2.ts';
import { sendMoney as sendMoneyCase3 } from '../cases/send-money-case-3.ts';
import { WATCHDOG_TIMEOUT_MS } from '../constants.ts';
import { RemediationControl } from './RemediationControl.tsx';

interface SendReceiveViewProps {
  accounts: Account[];
  recipients: Recipient[];
  transactions: Transaction[];
  onSendMoneyComplete: (fromId: string, recipient: string, amount: number, status: 'SUCCESS' | 'FAILED', wasPending: boolean) => Transaction;
  onRequestMoney: (fromId: string, recipient: Recipient, amount: number, reason: string) => void;
  onSplitBill: (fromId: string, participants: Recipient[], amount: number, reason: string) => void;
  onRemediate: (transactionId: string) => void;
  onCancelTransaction: (transactionId: string) => void;
  onClose: () => void;
}

const caseDetails: { id: TestCase; title: string; description: string }[] = [
  { id: 'random', title: 'Random', description: '25% chance of a slow response (8-10s), 15% chance of failure.' },
  { id: 'case1', title: 'Fast Success', description: 'Guaranteed success in 3-4 seconds. Watchdog will not trigger.' },
  { id: 'case2', title: 'Slow Success', description: 'Guaranteed success between 9-13 seconds. Watchdog will trigger.' },
  { id: 'case3', title: 'Slow Failure', description: 'Guaranteed failure between 13-14 seconds. Both watchdogs will trigger.' },
];

type ZelleTab = 'send' | 'request' | 'split' | 'activity' | 'settings';

export const SendReceiveView: React.FC<SendReceiveViewProps> = (props) => {
  const { accounts, recipients, transactions, onSendMoneyComplete, onRequestMoney, onSplitBill, onRemediate, onCancelTransaction, onClose } = props;
  
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.IDLE);
  const [traceId, setTraceId] = useState<string>('');
  const [transactionAmount, setTransactionAmount] = useState<number>(0);
  const [activeCase, setActiveCase] = useState<TestCase>('random');
  
  const [fromAccount, setFromAccount] = useState(accounts[0]?.id || '');
  const [currentRecipient, setCurrentRecipient] = useState('');
  const [eventLog, setEventLog] = useState<LogEntry[]>([]);
  const loggedLines = useRef(new Set());
  const [activeSubTab, setActiveSubTab] = useState<ZelleTab>('send');
  const [remediableTx, setRemediableTx] = useState<Transaction | null>(null);
  const [showScamWarning, setShowScamWarning] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<{ recipient: string, amount: number } | null>(null);
  
  const [showVerifyInfoModal, setShowVerifyInfoModal] = useState(false);
  const [paymentToVerify, setPaymentToVerify] = useState<{ recipient: string; amount: number } | null>(null);

  const watchdogTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasPending = useRef<boolean>(false);

  useEffect(() => {
    if (!fromAccount && accounts[0]) {
      setFromAccount(accounts[0].id);
    }
  }, [accounts, fromAccount]);
  
  const addLogEntry = (source: 'FE' | 'BE', message: string, traceId?: string) => {
    const newEntry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      source,
      message,
      traceId,
    };
    setEventLog(prev => [...prev, newEntry]);
  };

  const handleInitiateSend = (recipientContact: string, amount: number) => {
    const isFirstTimePayment = !transactions.some(tx => 
        tx.type === 'P2P' && 
        tx.status === 'SUCCESS' && 
        (tx.recipient?.contact === recipientContact || tx.description.includes(recipientContact))
    );
    const isSearchedRecipient = !recipients.some(r => r.contact === recipientContact);
    
    const recipientDisplayName = recipients.find(r => r.contact === recipientContact)?.name || recipientContact;

    setPaymentToVerify({ recipient: recipientDisplayName, amount });

    if (isSearchedRecipient || isFirstTimePayment) {
        setShowVerifyInfoModal(true);
    } else {
        // It's a repeat payment to a known contact, so we can proceed directly to the final send action.
        handleSendMoney(recipientDisplayName, amount);
    }
  };
  
  const handleVerificationConfirm = () => {
    if (!paymentToVerify) return;
    setShowVerifyInfoModal(false);
    // After verification, show the scam warning modal
    setPendingPayment({ recipient: paymentToVerify.recipient, amount: paymentToVerify.amount });
    setShowScamWarning(true);
    setPaymentToVerify(null);
  };

  const handleVerificationCancel = () => {
    setShowVerifyInfoModal(false);
    setPaymentToVerify(null);
  };

  const handleSendMoney = async (recipientName: string, amount: number) => {
    const newTraceId = crypto.randomUUID();
    setTraceId(newTraceId);
    setTransactionAmount(amount);
    setCurrentRecipient(recipientName);
    setStatus(TransactionStatus.PROCESSING);
    wasPending.current = false;
    loggedLines.current.clear();
    setEventLog([]);
    setRemediableTx(null);
    addLogEntry('FE', `P2P payment started. Case: ${activeCase}.`, newTraceId);

    if (watchdogTimer.current) clearTimeout(watchdogTimer.current);

    watchdogTimer.current = setTimeout(() => {
      wasPending.current = true;
      addLogEntry('FE', `Watchdog triggered! UI moved to "Pending".`, newTraceId);
      setStatus(TransactionStatus.PENDING_CONFIRMATION);
    }, WATCHDOG_TIMEOUT_MS);

    let paymentPromise: Promise<PaymentResult>;
    switch (activeCase) {
      case 'case1': paymentPromise = sendMoneyCase1(newTraceId, amount); break;
      case 'case2': paymentPromise = sendMoneyCase2(newTraceId, amount); break;
      case 'case3': paymentPromise = sendMoneyCase3(newTraceId, amount); break;
      default: paymentPromise = sendMoneyRandom(newTraceId, amount);
    }
    
    const result = await paymentPromise;
    if (watchdogTimer.current) clearTimeout(watchdogTimer.current);
    
    addLogEntry('BE', `TransactionResponse received. Status: ${result.status === 'SUCCESS' ? 'Success' : 'InternalHostError'}.`, result.traceId);

    if (result.status === 'SUCCESS') {
      setStatus(wasPending.current ? TransactionStatus.SUCCESS_AFTER_PENDING : TransactionStatus.SUCCESS);
      onSendMoneyComplete(fromAccount, recipientName, amount, 'SUCCESS', wasPending.current);
    } else {
      setStatus(wasPending.current ? TransactionStatus.FAILED_AFTER_PENDING : TransactionStatus.FAILED);
      const newTransaction = onSendMoneyComplete(fromAccount, recipientName, amount, 'FAILED', wasPending.current);
      if (newTransaction.wasPending) {
        setRemediableTx(newTransaction);
      }
    }
  };

  const handleConfirmSend = () => {
    if (pendingPayment) {
        handleSendMoney(pendingPayment.recipient, pendingPayment.amount);
        setShowScamWarning(false);
        setPendingPayment(null);
    }
  };
  
  const handleTracerLog = (line: number) => {
    if (loggedLines.current.has(line)) return;
    loggedLines.current.add(line);
    const selectedAccount = accounts.find(acc => acc.id === fromAccount);

    switch(line) {
      case 2: addLogEntry('FE', 'Building TransactionAddRequest...'); break;
      case 4: 
        addLogEntry('FE', `Set PaymentInfo: { Type: 'P2P', Amount: ${transactionAmount.toFixed(2)} }`);
        if(selectedAccount) addLogEntry('FE', `Set Debtor: { Account: '${selectedAccount.name}' }`);
        addLogEntry('FE', `Set Creditor: { UserIdentifier: '${currentRecipient}' }`);
        break;
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
  
  const renderSendTab = () => (
     <div className="mt-8 container mx-auto px-4">
        <fieldset className="bg-gray-50 p-4 rounded-lg shadow-inner border mb-8">
            <legend className="text-lg font-medium text-synovus-dark-gray mb-2 px-2">Select a Test Case</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {caseDetails.map(c => (<div key={c.id} onClick={() => setActiveCase(c.id)} className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${activeCase === c.id ? 'border-synovus-red bg-red-50' : 'border-gray-200 bg-white hover:border-gray-400'}`} role="radio" aria-checked={activeCase === c.id} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setActiveCase(c.id)}><h3 className="font-bold text-gray-800">{c.title}</h3><p className="text-sm text-gray-600 mt-1">{c.description}</p></div>))}
            </div>
        </fieldset>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-8">
                <div className="bg-gray-50 p-8 rounded-xl shadow-inner border">
                    {status === TransactionStatus.IDLE ? (
                        <SendForm onInitiateSend={handleInitiateSend} />
                    ) : (
                        <StatusDisplay status={status} traceId={traceId} onReset={handleReset} />
                    )}
                </div>
                <TracerDisplay status={status} traceId={traceId} amount={transactionAmount} activeCase={activeCase} onLog={handleTracerLog} />
                <RemediationControl remediableTx={remediableTx} onRemediate={onRemediate} />
            </div>
            
            <div className="flex flex-col gap-8">
                <RecipientTracerDisplay status={status} traceId={traceId} amount={transactionAmount} recipientEmail={currentRecipient} activeCase={activeCase} />
                <EventLog logs={eventLog} />
            </div>
        </div>
     </div>
  );

  interface SendFormProps {
    onInitiateSend: (recipient: string, amount: number) => void;
  }

  const SendForm: React.FC<SendFormProps> = ({ onInitiateSend }) => {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('50.00');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
          setError('Please enter a valid amount.');
          return;
        }
        if (!recipient.trim()) {
            setError('Please select or enter a recipient.');
            return;
        }
        const selectedAccount = accounts.find(acc => acc.id === fromAccount);
        if (!selectedAccount || numericAmount > selectedAccount.balance) {
          setError('Insufficient funds.');
          return;
        }
        onInitiateSend(recipient, numericAmount);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="recipient-send" className="block text-sm font-medium text-gray-700">Select or Enter Recipient</label>
                <div className="mt-1 flex items-center bg-gray-100 border-b-2 border-gray-300 focus-within:border-synovus-red p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                    <input type="text" id="recipient-send" value={recipient} onChange={e => setRecipient(e.target.value)} className="bg-transparent border-0 focus:ring-0 block w-full ml-2 text-gray-900" placeholder="Name, email, mobile #" />
                </div>
            </div>
             <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase text-center">Select Recipient</h3>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                    {recipients.map(r => (
                        <button type="button" key={r.id} onClick={() => setRecipient(r.contact)} className="w-full flex items-center p-2 rounded-md hover:bg-gray-100 text-left">
                            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-sm font-bold text-gray-600">{r.initials}</span>
                            <div className="ml-3">
                                <p className="font-medium text-gray-800 text-sm">{r.name}</p>
                                <p className="text-xs text-gray-500">{r.contact}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label htmlFor="amount-send" className="block text-sm font-medium text-gray-700">Amount</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">$</span></div>
                    <input type="text" name="amount-send" id="amount-send" value={amount} onChange={e => setAmount(e.target.value)} className="focus:ring-red-500 focus:border-red-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md" placeholder="0.00" />
                </div>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Review & Send</button>
        </form>
    );
  };
  
  const RequestForm: React.FC = () => {
    const [recipient, setRecipient] = useState<Recipient | null>(null);
    const [amount, setAmount] = useState('20.00');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (!recipient) {
            setError('Please select a recipient.');
            return;
        }
        onRequestMoney(fromAccount, recipient, numericAmount, reason);
        setActiveSubTab('activity');
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-8">
            <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Request from</h3>
                <div className="mt-2 space-y-1">
                    {recipients.map(r => (
                        <button type="button" key={r.id} onClick={() => setRecipient(r)} className={`w-full flex items-center p-2 rounded-md text-left border-2 ${recipient?.id === r.id ? 'border-synovus-red bg-red-50' : 'border-transparent hover:bg-gray-100'}`}>
                            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-sm font-bold text-gray-600">{r.initials}</span>
                            <div className="ml-3"><p className="font-medium text-gray-800 text-sm">{r.name}</p><p className="text-xs text-gray-500">{r.contact}</p></div>
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label htmlFor="amount-request" className="block text-sm font-medium text-gray-700">Amount</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">$</span></div>
                    <input type="text" name="amount-request" id="amount-request" value={amount} onChange={e => setAmount(e.target.value)} className="focus:ring-red-500 focus:border-red-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md" placeholder="0.00" />
                </div>
            </div>
            <div>
                 <label htmlFor="reason-request" className="block text-sm font-medium text-gray-700">Reason (Optional)</label>
                 <input type="text" name="reason-request" id="reason-request" value={reason} onChange={e => setReason(e.target.value)} className="mt-1 focus:ring-red-500 focus:border-red-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-synovus-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Request Money</button>
        </form>
    );
  };

  const SplitForm: React.FC = () => {
    const [participants, setParticipants] = useState<Recipient[]>([]);
    const [amount, setAmount] = useState('100.00');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const toggleParticipant = (p: Recipient) => {
        setParticipants(prev => prev.find(par => par.id === p.id) ? prev.filter(par => par.id !== p.id) : [...prev, p]);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (participants.length === 0) {
            setError('Please select at least one person to split with.');
            return;
        }
        onSplitBill(fromAccount, participants, numericAmount, reason);
        setActiveSubTab('activity');
    };

    const splitAmount = participants.length > 0 ? (parseFloat(amount) || 0) / (participants.length + 1) : 0;

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-8">
             <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Split with</h3>
                <div className="mt-2 space-y-1">
                    {recipients.map(p => (
                        <button type="button" key={p.id} onClick={() => toggleParticipant(p)} className={`w-full flex items-center p-2 rounded-md text-left border-2 ${participants.find(par => par.id === p.id) ? 'border-synovus-red bg-red-50' : 'border-transparent hover:bg-gray-100'}`}>
                            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-sm font-bold text-gray-600">{p.initials}</span>
                            <div className="ml-3"><p className="font-medium text-gray-800 text-sm">{p.name}</p><p className="text-xs text-gray-500">{p.contact}</p></div>
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label htmlFor="amount-split" className="block text-sm font-medium text-gray-700">Total Amount</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">$</span></div>
                    <input type="text" name="amount-split" id="amount-split" value={amount} onChange={e => setAmount(e.target.value)} className="focus:ring-red-500 focus:border-red-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md" placeholder="0.00" />
                </div>
            </div>
             <div>
                 <label htmlFor="reason-split" className="block text-sm font-medium text-gray-700">Reason (Optional)</label>
                 <input type="text" name="reason-split" id="reason-split" value={reason} onChange={e => setReason(e.target.value)} className="mt-1 focus:ring-red-500 focus:border-red-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </div>
            {participants.length > 0 && (
                <div className="p-3 bg-gray-100 rounded-md text-center">
                    <p className="text-sm text-gray-600">Each person pays</p>
                    <p className="text-2xl font-bold text-gray-800">${splitAmount.toFixed(2)}</p>
                </div>
            )}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-synovus-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Split Bill</button>
        </form>
    );
  };
  
  const ActivityTab: React.FC = () => {
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount));
    
    const pending = transactions.filter(tx => tx.status === 'PENDING').sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const past = transactions.filter(tx => tx.status !== 'PENDING').sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="max-w-3xl mx-auto mt-8">
            <div className="space-y-8">
                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Pending Activity</h2>
                    {pending.length > 0 ? (
                        <div className="space-y-4">
                            {pending.map(tx => (
                                <div key={tx.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase">{tx.type.replace('_', ' ')}</p>
                                            <p className="font-semibold text-gray-800">{tx.description}</p>
                                            {tx.expires && <p className="text-xs text-gray-500">{tx.expires}</p>}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-gray-900">{formatCurrency(tx.amount)}</p>
                                            <button onClick={() => onCancelTransaction(tx.id)} className="text-xs font-semibold text-gray-500 hover:text-red-600 flex items-center gap-1">Cancel <XIcon className="h-3 w-3" /></button>
                                        </div>
                                    </div>
                                    {tx.type === 'SPLIT_SENT' && tx.participants && (
                                        <div className="mt-2 pt-2 border-t">
                                            {tx.participants.map(p => (
                                                <div key={p.id} className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center">
                                                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-xs font-bold text-gray-600 mr-2">{p.initials}</span>
                                                        <span>{p.name}</span>
                                                    </div>
                                                    <span className="text-gray-600">Owes you {formatCurrency(tx.amount / (tx.participants.length + 1))}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-500 text-sm">No pending activity.</p>}
                </div>
                 <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Past Activity</h2>
                    {past.length > 0 ? (
                         <div className="space-y-4">
                           {past.map(tx => (
                                <div key={tx.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 opacity-80">
                                     <div className="flex justify-between items-start">
                                         <div>
                                            <p className={`text-xs font-bold uppercase ${tx.status === 'FAILED' ? 'text-red-500' : 'text-gray-500'}`}>{tx.type === 'P2P' ? `PAYMENT ${tx.status}` : tx.type.replace('_', ' ')}</p>
                                            <p className="font-semibold text-gray-800">{tx.description}</p>
                                             <p className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleDateString()}</p>
                                        </div>
                                        <p className={`text-xl font-bold ${tx.status === 'FAILED' ? 'text-red-700' : 'text-gray-900'}`}>{formatCurrency(tx.amount)}</p>
                                     </div>
                                </div>
                           ))}
                         </div>
                    ) : <p className="text-gray-500 text-sm">No past activity.</p>}
                </div>
            </div>
        </div>
    );
  };

  const SettingsTab: React.FC<{ accounts: Account[] }> = ({ accounts }) => {
    const [primaryAccountId, setPrimaryAccountId] = useState(accounts[0]?.id || '');
    const [email, setEmail] = useState('user@email.com');
    const [phone, setPhone] = useState('(555) 555-5555');
    const [requirePin, setRequirePin] = useState(true);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate saving
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 3000);
    };

    const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
        <svg className={`h-5 w-5 text-green-500 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
    );

    return (
        <div className="max-w-3xl mx-auto mt-8">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Profile Information Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Profile Information</h2>
                    <div className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Registered Email</label>
                            <div className="flex items-center justify-between">
                                <p className="text-gray-800">{email}</p>
                                <button type="button" className="text-sm font-semibold text-synovus-cyan-button hover:underline">Change</button>
                            </div>
                        </div>
                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Registered Mobile Number</label>
                             <div className="flex items-center justify-between">
                                <p className="text-gray-800">{phone}</p>
                                <button type="button" className="text-sm font-semibold text-synovus-cyan-button hover:underline">Change</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Primary Account Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Primary Account</h2>
                    <p className="text-sm text-gray-600 mb-3">Select the default account for sending and receiving money.</p>
                    <div className="space-y-2">
                        {accounts.map(account => (
                            <label key={account.id} className="flex items-center p-3 border rounded-md cursor-pointer has-[:checked]:bg-red-50 has-[:checked]:border-synovus-red">
                                <input
                                    type="radio"
                                    name="primary-account"
                                    value={account.id}
                                    checked={primaryAccountId === account.id}
                                    onChange={() => setPrimaryAccountId(account.id)}
                                    className="h-4 w-4 text-synovus-red focus:ring-synovus-red border-gray-300"
                                />
                                <span className="ml-3 text-sm font-medium text-gray-800">{account.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                 {/* Security Section */}
                 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Security</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-800">Require PIN</p>
                            <p className="text-sm text-gray-600">Require PIN entry for payments over $100.</p>
                        </div>
                        <button 
                            type="button" 
                            onClick={() => setRequirePin(!requirePin)}
                            className={`${requirePin ? 'bg-synovus-red' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
                        >
                            <span className={`${requirePin ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}/>
                        </button>
                    </div>
                </div>

                {/* Save Button & Confirmation */}
                <div className="flex items-center justify-end space-x-4">
                    {showConfirmation && (
                        <div className="flex items-center text-green-600">
                            <CheckIcon />
                            <span className="ml-2 text-sm font-semibold">Settings saved!</span>
                        </div>
                    )}
                    <button type="submit" className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-synovus-blue hover:bg-opacity-90">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
  };
  
   const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`h-4 w-4 text-gray-400 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
  );

  const TabButton: React.FC<{ tab: ZelleTab, children: React.ReactNode }> = ({ tab, children }) => (
    <button
      onClick={() => {
          setStatus(TransactionStatus.IDLE); // Reset tracer when switching tabs
          setActiveSubTab(tab)
      }}
      className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors ${activeSubTab === tab ? 'bg-synovus-red text-white border-synovus-red' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
    >
      {children}
    </button>
  );

  const renderContent = () => {
    switch (activeSubTab) {
      case 'send': return renderSendTab();
      case 'request': return <RequestForm />;
      case 'split': return <SplitForm />;
      case 'activity': return <ActivityTab />;
      case 'settings': return <SettingsTab accounts={accounts} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-40 overflow-y-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center">
            <h1 className="text-xl font-medium text-gray-800">Send Money with <span className="font-bold italic text-3xl tracking-tight">zelle<span className="text-zelle-purple text-4xl leading-none font-black">.</span></span></h1>
            <div className="border-b border-gray-200 w-full mt-4">
            <div className="flex justify-center space-x-2 sm:space-x-4">
                <TabButton tab="send">Send</TabButton>
                <TabButton tab="request">Request</TabButton>
                <TabButton tab="split">Split</TabButton>
                <TabButton tab="activity">Activity</TabButton>
                <TabButton tab="settings">Settings</TabButton>
            </div>
            </div>
        </div>
        {renderContent()}
        <div className="mt-8 text-center">
            <button onClick={onClose} className="w-full max-w-xs mx-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-synovus-cyan-button hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
                Close this window
            </button>
        </div>
      </div>
      {showScamWarning && pendingPayment && (
        <ScamWarningModal
          recipient={pendingPayment.recipient}
          onClose={() => {
            setShowScamWarning(false);
            setPendingPayment(null);
          }}
          onConfirm={handleConfirmSend}
        />
      )}
      {showVerifyInfoModal && paymentToVerify && (
        <VerifyInformationModal
            recipientName={paymentToVerify.recipient}
            onConfirm={handleVerificationConfirm}
            onCancel={handleVerificationCancel}
        />
      )}
    </div>
  );
};


const WarningShieldIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-800" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
    </svg>
);

const AwareShieldIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.06.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.95-.3-2.01-.663-2.837-.855A1.095 1.095 0 0 0 8 1.5c-.24 0-.47.08-.662.09zM8 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 1a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
    </svg>
);

interface ScamWarningModalProps {
    recipient: string;
    onClose: () => void;
    onConfirm: () => void;
}

const ScamWarningModal: React.FC<ScamWarningModalProps> = ({ recipient, onClose, onConfirm }) => {
    const [isChecked, setIsChecked] = useState(false);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start pt-12 sm:items-center sm:pt-0">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
                    <h2 className="text-lg font-semibold text-gray-800">Send money with Zelle®</h2>
                    <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Sub-Header */}
                <div className="bg-gray-200 p-4 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-medium text-gray-700">Stay Safe From Scams</h3>
                    <button onClick={onClose} className="text-sm font-semibold text-red-600 hover:underline">Cancel</button>
                </div>
                
                <div className="p-6 space-y-4 overflow-y-auto">
                    {/* Recipient Info */}
                    <p className="text-gray-700">
                        Since you're sending money to <strong className="font-bold break-all">{recipient}</strong> for the first time...
                    </p>

                    {/* First Warning */}
                    <div className="bg-gray-100 p-4 rounded-md flex items-start space-x-3">
                        <div className="flex-shrink-0">
                           <WarningShieldIcon />
                        </div>
                        <p className="text-gray-700 text-sm">
                            Think of paying with Zelle® like handing over cash. Once it's been received, your money can't be recovered.
                        </p>
                    </div>

                    {/* BE AWARE Section */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <AwareShieldIcon />
                            <h4 className="font-bold text-gray-800 tracking-wide">BE AWARE!</h4>
                        </div>
                        
                        <div className="p-4 border rounded-md text-sm text-gray-600">
                            We will never ask you to refund or send money to anyone, including us or yourself. Call us at <span className="font-semibold">1-888-SYNOVUS (1-888-796-6887)</span> to verify.
                        </div>
                         <div className="p-4 border rounded-md text-sm text-gray-600">
                            Don't send money as a result of an unexpected text, call or email – it could be a scam.
                        </div>
                         <div className="p-4 border rounded-md text-sm text-gray-600">
                            Scammers use urgency to get you to act now. Be wary any time someone wants you to act now.
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 space-y-4">
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={() => setIsChecked(!isChecked)}
                                className="mt-0.5 h-4 w-4 text-synovus-blue focus:ring-synovus-blue border-gray-300 rounded flex-shrink-0"
                            />
                            <span className="text-sm text-gray-700">I've read and understand the information above.</span>
                        </label>

                        <button
                            onClick={onConfirm}
                            disabled={!isChecked}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-synovus-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VerifyInformationIcon: React.FC = () => (
    <svg className="h-16 w-16 text-gray-800" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* 1. Draw the coin */}
            <circle cx="30" cy="32" r="20"/>
            <path d="M35 26H28C26.3431 26 25 27.3431 25 29V29C25 30.6569 26.3431 32 28 32H32C33.6569 32 35 33.3431 35 35V35C35 36.6569 33.6569 38 32 38H25"/>
            <path d="M30 24V40"/>
            
            {/* 2. Draw the lock shape with a white fill to "erase" the coin behind it */}
            <g fill="white" stroke="white" strokeWidth="1">
              <rect x="37" y="34" width="22" height="16" rx="3"/>
              <path d="M40 34V27C40 22.5817 43.5817 19 48 19C52.4183 19 56 22.5817 56 27V34"/>
            </g>
            
            {/* 3. Draw the lock outline on top */}
            <rect x="37" y="34" width="22" height="16" rx="3"/>
            <path d="M40 34V27C40 22.5817 43.5817 19 48 19C52.4183 19 56 22.5817 56 27V34"/>
        </g>
    </svg>
);


interface VerifyInformationModalProps {
    recipientName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const VerifyInformationModal: React.FC<VerifyInformationModalProps> = ({ recipientName, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm text-center p-6">
                <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Verify Information</h2>
                <div className="my-6 flex justify-center">
                    <VerifyInformationIcon />
                </div>
                <p className="text-gray-700">Please confirm you want to send money to:</p>
                <p className="font-bold text-xl text-gray-900 my-2 break-all">{recipientName}</p>
                <p className="text-sm text-gray-600">If this looks right to you, select Continue.</p>
                <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
                     <button
                        onClick={onConfirm}
                        className="w-full sm:w-1/2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-synovus-cyan-button hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                        Continue
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full sm:w-1/2 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};