import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PaymentsView } from './components/PaymentsView';
import { AccountsView } from './components/AccountsView';
import { TransfersView } from './components/TransfersView';
import { SendReceiveView } from './components/SendReceiveView';
import { Transaction, TransactionType } from './types';

type Tab = 'ACCOUNTS' | 'PAYMENTS' | 'TRANSFERS' | 'SEND_RECEIVE';

export interface Account {
  id: string;
  name: string;
  balance: number;
}

const initialAccounts: Account[] = [
    { id: 'checking-1234', name: 'Checking (...1234)', balance: 5420.50 },
    { id: 'savings-5678', name: 'Savings (...5678)', balance: 12890.15 },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('PAYMENTS');
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      ...transactionData,
    };
    setTransactionHistory(prev => [newTransaction, ...prev]);
  };
  
  const remediateTransaction = (transactionId: string) => {
    const txToRemediate = transactionHistory.find(tx => tx.id === transactionId);
    if (!txToRemediate) return;

    // Simulate a 50% chance of the transaction having actually succeeded
    if (Math.random() < 0.5) {
        console.log(`[Remediation] Reconciling transaction ${transactionId} as SUCCESSFUL.`);

        setTransactionHistory(prev => 
            prev.map(tx => tx.id === transactionId ? { ...tx, status: 'SUCCESS' } : tx)
        );

        setAccounts(prevAccounts => {
            const newAccounts = prevAccounts.map(acc => ({ ...acc }));
            const fromAccount = newAccounts.find(acc => acc.id === txToRemediate.fromAccountId);

            if (!fromAccount) return prevAccounts;

            // Apply the balance change that was skipped during initial failure
            const amount = Math.abs(txToRemediate.amount);
            switch (txToRemediate.type) {
                case 'PAYMENT':
                case 'P2P':
                    fromAccount.balance -= amount;
                    break;
                case 'TRANSFER':
                    const toAccount = newAccounts.find(acc => acc.id === txToRemediate.toAccountId);
                    if (toAccount) {
                        fromAccount.balance -= amount;
                        toAccount.balance += amount;
                    }
                    break;
            }
            return newAccounts;
        });
        alert(`Transaction ${transactionId.slice(0,8)}... has been successfully reconciled.`);
    } else {
        console.log(`[Remediation] Transaction ${transactionId} confirmed as FAILED. No change.`);
        alert(`Status for transaction ${transactionId.slice(0,8)}... checked. It remains FAILED.`);
    }
  };

  const handleTransferCompletion = (fromId: string, toId: string, amount: number, status: 'SUCCESS' | 'FAILED') => {
    let fromAccountName = '';
    let toAccountName = '';
    const fromAccount = accounts.find(acc => acc.id === fromId);
    const toAccount = accounts.find(acc => acc.id === toId);
    if(fromAccount) fromAccountName = fromAccount.name;
    if(toAccount) toAccountName = toAccount.name;

    if (status === 'SUCCESS') {
        setAccounts(prevAccounts => {
            const newAccounts = prevAccounts.map(acc => ({ ...acc }));
            const fromAcc = newAccounts.find(acc => acc.id === fromId);
            const toAcc = newAccounts.find(acc => acc.id === toId);

            if (fromAcc && toAcc) {
                fromAcc.balance -= amount;
                toAcc.balance += amount;
            }
            return newAccounts;
        });
        addTransaction({ description: `Transfer to ${toAccountName}`, amount: -amount, status: 'SUCCESS', type: 'TRANSFER', fromAccountId: fromId, toAccountId: toId });
        addTransaction({ description: `Transfer from ${fromAccountName}`, amount: amount, status: 'SUCCESS', type: 'TRANSFER', fromAccountId: fromId, toAccountId: toId });
    } else {
        addTransaction({ description: `Failed Transfer to ${toAccountName}`, amount: -amount, status: 'FAILED', type: 'TRANSFER', fromAccountId: fromId, toAccountId: toId });
    }
  };

  const handlePaymentCompletion = (fromId: string, amount: number, status: 'SUCCESS' | 'FAILED') => {
    if (status === 'SUCCESS') {
        setAccounts(prevAccounts => {
          const newAccounts = prevAccounts.map(acc => ({ ...acc }));
          const fromAccount = newAccounts.find(acc => acc.id === fromId);
          if (fromAccount) fromAccount.balance -= amount;
          return newAccounts;
        });
        addTransaction({ description: 'Bill Payment to Merchant', amount: -amount, status: 'SUCCESS', type: 'PAYMENT', fromAccountId: fromId });
    } else {
        addTransaction({ description: 'Failed Bill Payment', amount: -amount, status: 'FAILED', type: 'PAYMENT', fromAccountId: fromId });
    }
  };
  
  const handleSendMoneyCompletion = (fromId: string, recipient: string, amount: number, status: 'SUCCESS' | 'FAILED') => {
    if (status === 'SUCCESS') {
        setAccounts(prevAccounts => {
          const newAccounts = prevAccounts.map(acc => ({ ...acc }));
          const fromAccount = newAccounts.find(acc => acc.id === fromId);
          if (fromAccount) fromAccount.balance -= amount;
          return newAccounts;
        });
        addTransaction({ description: `P2P Payment to ${recipient}`, amount: -amount, status: 'SUCCESS', type: 'P2P', fromAccountId: fromId, recipient });
    } else {
        addTransaction({ description: `Failed P2P Payment to ${recipient}`, amount: -amount, status: 'FAILED', type: 'P2P', fromAccountId: fromId, recipient });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'ACCOUNTS':
        return <AccountsView accounts={accounts} transactions={transactionHistory} onRemediate={remediateTransaction} />;
      case 'PAYMENTS':
        return <PaymentsView accounts={accounts} onPaymentComplete={handlePaymentCompletion} />;
      case 'TRANSFERS':
        return <TransfersView accounts={accounts} onTransferComplete={handleTransferCompletion} />;
      case 'SEND_RECEIVE':
        return <SendReceiveView accounts={accounts} onSendMoneyComplete={handleSendMoneyCompletion} />;
      default:
        return <PaymentsView accounts={accounts} onPaymentComplete={handlePaymentCompletion} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
