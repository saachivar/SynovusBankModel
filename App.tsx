import React, { useState, useCallback } from 'react';
import { Header, AlertBannerType } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { AccountsView } from './components/AccountsView.tsx';
import { PaymentsView } from './components/PaymentsView.tsx';
import { TransfersView } from './components/TransfersView.tsx';
import { SendReceiveView } from './components/SendReceiveView.tsx';
import { InsightsView } from './components/InsightsView.tsx';
import { PlanningView } from './components/PlanningView.tsx';
import { FaqsSupportView } from './components/FaqsSupportView.tsx';
import { RemediationTracerModal } from './components/RemediationTracerModal.tsx';
import { RemediationResultModal } from './components/RemediationResultModal.tsx';
import { AddAccountModal } from './components/AddAccountModal.tsx';
import { ApplicationSubmittedModal } from './components/ApplicationSubmittedModal.tsx';
import { EnrollBillPayModal } from './components/EnrollBillPayModal.tsx';
import { EnrollmentCompleteModal } from './components/EnrollmentCompleteModal.tsx';
import { LoginView } from './components/LoginView.tsx';
import { Transaction, Recipient, Tab, Account } from './types.ts';

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
        trueStatus: 'SUCCESS',
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
        trueStatus: 'SUCCESS',
    }
];



function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('ACCOUNTS');
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [recipients] = useState<Recipient[]>(initialRecipients);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [remediationTransaction, setRemediationTransaction] = useState<Transaction | null>(null);
  const [remediationResult, setRemediationResult] = useState<{ status: 'SUCCESS' | 'FAILED'; tx: Transaction } | null>(null);
  const [showZelle, setShowZelle] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAppSubmittedModal, setShowAppSubmittedModal] = useState(false);
  const [showEnrollBillPayModal, setShowEnrollBillPayModal] = useState(false);
  const [showEnrollmentCompleteModal, setShowEnrollmentCompleteModal] = useState(false);

  const initialAlerts: AlertBannerType[] = [
    {
      id: 1,
      visible: true,
      type: 'reminder',
      title: 'Payment Reminder',
      message: 'Your Synovus Visa Signature card payment is due in 5 days.',
      actionText: 'Make a Payment',
      action: () => {
        setActiveTab('PAYMENTS');
      },
    },
    {
      id: 2,
      visible: true,
      type: 'info',
      title: 'Go Paperless',
      message: 'Simplify your life and help the environment. Switch to paperless statements today.',
      actionText: 'Learn More',
      action: () => alert('This would navigate to the paperless statements settings page.'),
    },
  ];

  const [alertBanners, setAlertBanners] = useState<AlertBannerType[]>(initialAlerts);

  const handleDismissAlert = (id: number) => {
    setAlertBanners(prev => prev.map(alert => alert.id === id ? { ...alert, visible: false } : alert));
  };

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

  const handlePaymentComplete = useCallback((fromId: string, payee: string, amount: number, status: 'SUCCESS' | 'FAILED', wasPending: boolean, trueStatus?: 'SUCCESS' | 'FAILED'): Transaction => {
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
        remediationAttempted: false,
        trueStatus: status === 'SUCCESS' ? 'SUCCESS' : trueStatus
    });
  }, [addTransaction]);

  const handleTransferComplete = useCallback((fromId: string, toId: string, amount: number, status: 'SUCCESS' | 'FAILED', wasPending: boolean, trueStatus?: 'SUCCESS' | 'FAILED'): Transaction => {
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
        remediationAttempted: false,
        trueStatus: status === 'SUCCESS' ? 'SUCCESS' : trueStatus,
    });
  }, [addTransaction, accounts]);

  const handleSendMoneyComplete = useCallback((fromId: string, recipientName: string, amount: number, status: 'SUCCESS' | 'FAILED', wasPending: boolean, trueStatus?: 'SUCCESS' | 'FAILED'): Transaction => {
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
        remediationAttempted: false,
        trueStatus: status === 'SUCCESS' ? 'SUCCESS' : trueStatus,
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
            const wasActuallySuccess = txToRemediate.trueStatus === 'SUCCESS';
            let finalTx: Transaction = txToRemediate;
            
            setTransactions(prev => prev.map(tx => {
                if (tx.id === transactionId) {
                    const newStatus: 'SUCCESS' | 'FAILED' = wasActuallySuccess ? 'SUCCESS' : 'FAILED';
                    // Only update status if it's changing
                    const updatedTx = tx.status === newStatus ? tx : { ...tx, status: newStatus };
                    finalTx = updatedTx;
                    
                    // If remediation found a success that was previously marked as failed, correct balances.
                    if (wasActuallySuccess && tx.status === 'FAILED') {
                        setAccounts(prevAccounts => prevAccounts.map(acc => {
                            if (acc.id === updatedTx.fromAccountId) return { ...acc, balance: acc.balance + updatedTx.amount }; // amount is negative
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

  const handleLogin = () => {
    setIsAuthenticated(true);
    setActiveTab('ACCOUNTS'); // Reset to default view on login
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'ACCOUNTS':
        return <AccountsView accounts={accounts} transactions={transactions} onNavigate={handleNavigate} onShowZelle={() => setShowZelle(true)} onAddAccount={() => setShowAddAccountModal(true)} onEnrollInBillPay={() => setShowEnrollBillPayModal(true)} onRemediate={handleRemediate} />;
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
        return <AccountsView accounts={accounts} transactions={transactions} onNavigate={handleNavigate} onShowZelle={() => setShowZelle(true)} onAddAccount={() => setShowAddAccountModal(true)} onEnrollInBillPay={() => setShowEnrollBillPayModal(true)} onRemediate={handleRemediate} />;
    }
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <Header
        activeTab={activeTab}
        onNavigate={handleNavigate}
        userName="SynovusTracer"
        alerts={alertBanners}
        onDismissAlert={handleDismissAlert}
        onLogout={handleLogout}
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
      {showAddAccountModal && <AddAccountModal onClose={() => setShowAddAccountModal(false)} onSubmit={handleAddAccountSubmit} />}
      {showAppSubmittedModal && <ApplicationSubmittedModal onClose={() => setShowAppSubmittedModal(false)} />}
      {showEnrollBillPayModal && <EnrollBillPayModal accounts={accounts} onClose={() => setShowEnrollBillPayModal(false)} onSubmit={handleEnrollBillPaySubmit} />}
      {showEnrollmentCompleteModal && <EnrollmentCompleteModal onClose={handleCloseEnrollmentComplete} />}
    </div>
  );
}

export default App;
