import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PaymentsView } from './components/PaymentsView';
import { AccountsView } from './components/AccountsView';
import { TransfersView } from './components/TransfersView';
import { SendReceiveView } from './components/SendReceiveView';
import { Transaction } from './types';

type Tab = 'ACCOUNTS' | 'PAYMENTS' | 'TRANSFERS' | 'SEND_RECEIVE';

// Define account type for clarity and reuse
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

  const addTransaction = (description: string, amount: number) => {
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      description,
      amount,
    };
    setTransactionHistory(prev => [newTransaction, ...prev]);
  };

  const handleTransferSuccess = (fromId: string, toId: string, amount: number) => {
    let fromAccountName = '';
    let toAccountName = '';

    setAccounts(prevAccounts => {
        const newAccounts = prevAccounts.map(acc => ({ ...acc }));
        const fromAccount = newAccounts.find(acc => acc.id === fromId);
        const toAccount = newAccounts.find(acc => acc.id === toId);

        if (fromAccount && toAccount && fromAccount.balance >= amount) {
            fromAccount.balance -= amount;
            toAccount.balance += amount;
            fromAccountName = fromAccount.name;
            toAccountName = toAccount.name;
        }
        return newAccounts;
    });

    addTransaction(`Transfer to ${toAccountName}`, -amount);
    addTransaction(`Transfer from ${fromAccountName}`, amount);
  };

  const handlePaymentSuccess = (fromId: string, amount: number) => {
    setAccounts(prevAccounts => {
      const newAccounts = prevAccounts.map(acc => ({ ...acc }));
      const fromAccount = newAccounts.find(acc => acc.id === fromId);

      if (fromAccount && fromAccount.balance >= amount) {
        fromAccount.balance -= amount;
      }
      return newAccounts;
    });

    addTransaction('Bill Payment to Merchant', -amount);
  };
  
  const handleSendMoneySuccess = (fromId: string, recipient: string, amount: number) => {
    setAccounts(prevAccounts => {
      const newAccounts = prevAccounts.map(acc => ({ ...acc }));
      const fromAccount = newAccounts.find(acc => acc.id === fromId);

      if (fromAccount && fromAccount.balance >= amount) {
        fromAccount.balance -= amount;
      }
      return newAccounts;
    });

    addTransaction(`P2P Payment to ${recipient}`, -amount);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'ACCOUNTS':
        return <AccountsView accounts={accounts} transactions={transactionHistory} />;
      case 'PAYMENTS':
        return <PaymentsView accounts={accounts} onPaymentSuccess={handlePaymentSuccess} />;
      case 'TRANSFERS':
        return <TransfersView accounts={accounts} onTransferSuccess={handleTransferSuccess} />;
      case 'SEND_RECEIVE':
        return <SendReceiveView accounts={accounts} onSendMoneySuccess={handleSendMoneySuccess} />;
      default:
        return <PaymentsView accounts={accounts} onPaymentSuccess={handlePaymentSuccess} />;
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
