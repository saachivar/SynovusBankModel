import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AccountsView } from './components/AccountsView';
import { PaymentsView } from './components/PaymentsView';
import { TransfersView } from './components/TransfersView';
import { SendReceiveView } from './components/SendReceiveView';
import { InsightsView } from './components/InsightsView';
import { PlanningView } from './components/PlanningView';
import { FaqsSupportView } from './components/FaqsSupportView';
import { RemediationTracerModal } from './components/RemediationTracerModal';
import { RemediationResultModal } from './components/RemediationResultModal';
import { AlertsModal } from './components/AlertsModal';
import { AddAccountModal } from './components/AddAccountModal';
import { ApplicationSubmittedModal } from './components/ApplicationSubmittedModal';
import { EnrollBillPayModal } from './components/EnrollBillPayModal';
import { EnrollmentCompleteModal } from './components/EnrollmentCompleteModal';
import { Transaction, Recipient } from './types';

export type Tab = 'ACCOUNTS' | 'PAYMENTS' | 'TRANSFERS' | 'INSIGHTS' | 'PLANNING' | 'FAQS_SUPPORT';

export interface Account {
  id: string;
  name: string;
  balance: number;
}

const initialAccounts: Account[] = [
    { id: 'acc-1', name: 'Synovus Checking (...4321)', balance: 12532.89 },
    { id: 'acc-2', name: 'Synovus Savings (...8765)', balance: 54010.11 },
];

const initialRecipients: Recipient[] = [
  { id: 'rec-1', name: 'Alex Williams', contact: 'alex@email.com', initials: 'AW' },
  { id: 'rec-2', name: 'Samantha Jones', contact: '(555) 123-4567', initials: 'SJ' },
  { id: 'rec-3', name: 'David Smith', contact: '(555) 987-6543', initials: 'DS' },
];

const initialTransactions: Transaction[] = [
    {
        id: 'tx-1',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        type: 'PAYMENT',
        description: 'Payment to City Power & Light',
        amount: -75.50,
        status: 'SUCCESS',
        fromAccountId: 'acc-1',
        wasPending: false,
        remediationAttempted: false,
    },
    {
        id: 'tx-2',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        type: 'P2P',
        description: 'Payment to Alex Williams',
        amount: -25.00,
        status: 'SUCCESS',
        fromAccountId: 'acc-1',
        recipient: initialRecipients[0],
        wasPending: false,
        remediationAttempted: false,
    }
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('ACCOUNTS');
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [recipients] = useState<Recipient[]>(initialRecipients);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [remediationTransaction, setRemediationTransaction] = useState<Transaction | null>(null);
  const [remediationResult, setRemediationResult] = useState<{ status: 'SUCCESS' | 'FAILED'; tx: Transaction } | null>(null);
  const [showZelle, setShowZelle] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAppSubmittedModal, setShowAppSubmittedModal] = useState(false);
  const [showEnrollBillPayModal, setShowEnrollBillPayModal] = useState(false);
  const [showEnrollmentCompleteModal, setShowEnrollmentCompleteModal] = useState(false);

  const handleNavigate = (tab: Tab) => {
    setActiveTab(tab);
  };

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'timestamp'>): Transaction => {
    const newTransaction: Transaction = {
        ...tx,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  }, []);

  const handlePaymentComplete = useCallback((fromId: string, payee: string, amount: number, status: 'SUCCESS' | 'FAILED', wasPending: boolean): Transaction => {
    if (status === 'SUCCESS') {
        setAccounts(prevAccounts => prevAccounts.map(acc => 
            acc.id === fromId ? { ...acc, balance: acc.balance - amount } : acc
        ));
    }
    return addTransaction({
        type: 'PAYMENT',
        description: `Payment to ${payee}`,
        amount: -amount,
        status,
        fromAccountId: fromId,
        wasPending,
        remediationAttempted: false
    });
  }, [addTransaction]);

  const handleTransferComplete = useCallback((fromId: string, toId: string, amount: number, status: 'SUCCESS' | 'FAILED', wasPending: boolean): Transaction => {
    const toAccount = accounts.find(a => a.id === toId);

    if (status === 'SUCCESS') {
        setAccounts(prevAccounts => prevAccounts.map(acc => {
            if (acc.id === fromId) return { ...acc, balance: acc.balance - amount };
            if (acc.id === toId) return { ...acc, balance: acc.balance + amount };
            return acc;
        }));
    }
    return addTransaction({
        type: 'TRANSFER',
        description: `Transfer to ${toAccount?.name}`,
        amount: -amount,
        status,
        fromAccountId: fromId,
        toAccountId: toId,
        wasPending,
        remediationAttempted: false
    });
  }, [addTransaction, accounts]);

  const handleSendMoneyComplete = useCallback((fromId: string, recipientName: string, amount: number, status: 'SUCCESS' | 'FAILED', wasPending: boolean): Transaction => {
    const recipient = recipients.find(r => r.name === recipientName);
    if (status === 'SUCCESS') {
        setAccounts(prevAccounts => prevAccounts.map(acc => 
            acc.id === fromId ? { ...acc, balance: acc.balance - amount } : acc
        ));
    }
     return addTransaction({
        type: 'P2P',
        description: `Payment to ${recipientName}`,
        amount: -amount,
        status,
        fromAccountId: fromId,
        recipient,
        wasPending,
        remediationAttempted: false
    });
  }, [addTransaction, recipients]);

  const handleRequestMoney = useCallback((fromId: string, recipient: Recipient, amount: number, reason: string) => {
    addTransaction({
      type: 'REQUEST_SENT',
      description: reason || `Request to ${recipient.name}`,
      amount,
      status: 'PENDING',
      recipient,
      fromAccountId: fromId,
      expires: 'Expires Oct 23'
    });
  }, [addTransaction]);
  
  const handleSplitBill = useCallback((fromId: string, participants: Recipient[], amount: number, reason: string) => {
    addTransaction({
      type: 'SPLIT_SENT',
      description: reason || `You and ${participants.length} other${participants.length > 1 ? 's' : ''}`,
      amount,
      status: 'PENDING',
      participants,
      fromAccountId: fromId,
      expires: 'Expires Oct 23'
    });
  }, [addTransaction]);
  
  const handleCancelTransaction = useCallback((transactionId: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== transactionId));
  }, []);

  const handleRemediate = (transactionId: string) => {
    const txToRemediate = transactions.find(tx => tx.id === transactionId);
    if (txToRemediate) {
        setTransactions(prev => prev.map(tx => tx.id === transactionId ? { ...tx, remediationAttempted: true } : tx));
        setRemediationTransaction(txToRemediate);
        
        setTimeout(() => {
            const wasActuallySuccess = Math.random() < 0.4;
            let finalTx: Transaction = txToRemediate;
            
            setTransactions(prev => prev.map(tx => {
                if (tx.id === transactionId) {
                    const newStatus: 'SUCCESS' | 'FAILED' = wasActuallySuccess ? 'SUCCESS' : 'FAILED';
                    const updatedTx = { ...tx, status: newStatus };
                    finalTx = updatedTx;
                    if (wasActuallySuccess) {
                        setAccounts(prevAccounts => prevAccounts.map(acc => {
                            if (acc.id === updatedTx.fromAccountId) return { ...acc, balance: acc.balance + updatedTx.amount };
                            if (acc.id === updatedTx.toAccountId) return { ...acc, balance: acc.balance - updatedTx.amount }; 
                            return acc;
                        }));
                    }
                    return updatedTx;
                }
                return tx;
            }));
            setRemediationTransaction(null);
            setRemediationResult({ status: finalTx.status as 'SUCCESS' | 'FAILED', tx: finalTx });
        }, 3000);
    }
  };

  const handleAddAccountSubmit = () => {
    setShowAddAccountModal(false);
    setTimeout(() => {
      setShowAppSubmittedModal(true);
    }, 300); // Short delay for smoother transition
  };
  
  const handleEnrollBillPaySubmit = () => {
    setShowEnrollBillPayModal(false);
    setTimeout(() => {
      setShowEnrollmentCompleteModal(true);
    }, 300);
  };
  
  const handleCloseEnrollmentComplete = () => {
    setShowEnrollmentCompleteModal(false);
    setActiveTab('PAYMENTS');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'ACCOUNTS':
        return <AccountsView accounts={accounts} onNavigate={handleNavigate} onShowZelle={() => setShowZelle(true)} onAddAccount={() => setShowAddAccountModal(true)} onEnrollInBillPay={() => setShowEnrollBillPayModal(true)} />;
      case 'PAYMENTS':
        return <PaymentsView accounts={accounts} onPaymentComplete={handlePaymentComplete} onRemediate={handleRemediate} />;
      case 'TRANSFERS':
        return <TransfersView accounts={accounts} onTransferComplete={handleTransferComplete} onRemediate={handleRemediate} />;
      case 'INSIGHTS':
        return <InsightsView />;
      case 'PLANNING':
        return <PlanningView />;
      case 'FAQS_SUPPORT':
        return <FaqsSupportView />;
      default:
        return <AccountsView accounts={accounts} onNavigate={handleNavigate} onShowZelle={() => setShowZelle(true)} onAddAccount={() => setShowAddAccountModal(true)} onEnrollInBillPay={() => setShowEnrollBillPayModal(true)} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <Header
        activeTab={activeTab}
        onNavigate={handleNavigate}
        userName="User"
        onShowAlerts={() => setShowAlertsModal(true)}
      />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
      <Footer />
      {showZelle && (
         <SendReceiveView
            accounts={accounts}
            recipients={recipients}
            transactions={transactions}
            onSendMoneyComplete={handleSendMoneyComplete}
            onRequestMoney={handleRequestMoney}
            onSplitBill={handleSplitBill}
            onRemediate={handleRemediate}
            onCancelTransaction={handleCancelTransaction}
            onClose={() => setShowZelle(false)}
          />
      )}
      <RemediationTracerModal transaction={remediationTransaction} />
      <RemediationResultModal result={remediationResult} onClose={() => setRemediationResult(null)} />
      {showAlertsModal && <AlertsModal onClose={() => setShowAlertsModal(false)} />}
      {showAddAccountModal && <AddAccountModal onClose={() => setShowAddAccountModal(false)} onSubmit={handleAddAccountSubmit} />}
      {showAppSubmittedModal && <ApplicationSubmittedModal onClose={() => setShowAppSubmittedModal(false)} />}
      {showEnrollBillPayModal && <EnrollBillPayModal accounts={accounts} onClose={() => setShowEnrollBillPayModal(false)} onSubmit={handleEnrollBillPaySubmit} />}
      {showEnrollmentCompleteModal && <EnrollmentCompleteModal onClose={handleCloseEnrollmentComplete} />}
    </div>
  );
}

export default App;