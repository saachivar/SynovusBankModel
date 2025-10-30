// components/ActivityView.tsx

import React from 'react';
import { Transaction } from '../types';

interface ActivityViewProps {
    transactions: Transaction[];
    onRemediate: (transactionId: string) => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({ transactions, onRemediate }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };
  
  const pendingTransactions = transactions.filter(tx => tx.status === 'PENDING');
  const pastTransactions = transactions.filter(tx => tx.status === 'SUCCESS' || tx.status === 'FAILED');

  const isRemediatable = (transaction: Transaction): boolean => {
    return transaction.status === 'FAILED' && !!transaction.wasPending && !transaction.remediationAttempted;
  };

  const TransactionCard: React.FC<{ tx: Transaction }> = ({ tx }) => {
    let title: string = tx.type;
    let subtext = tx.description;
    let amountDisplay = formatCurrency(tx.amount);
    
    switch (tx.type) {
        case 'P2P':
            title = `PAYMENT ${tx.status}`;
            break;
        case 'PAYMENT':
            title = `BILL PAY ${tx.status}`;
            break;
        case 'TRANSFER':
            title = `TRANSFER ${tx.status}`;
            break;
        case 'REQUEST_SENT':
            title = 'REQUEST SENT';
            subtext = `You requested from ${tx.recipient?.name}`;
            break;
        case 'SPLIT_SENT':
            title = 'SPLIT SENT';
            const numOthers = (tx.participants?.length ?? 0);
            subtext = `You and ${numOthers} other${numOthers !== 1 ? 's' : ''}`;
            break;
    }

    return (
        <div className={`bg-white p-4 rounded-lg shadow-sm border ${isRemediatable(tx) ? 'border-yellow-400' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">{title}</p>
                    <p className="text-gray-800 font-semibold">{subtext}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                </div>
                <div className="text-right">
                    <p className={`text-xl font-bold ${isRemediatable(tx) ? 'text-yellow-600' : tx.status === 'FAILED' ? 'text-synovus-red' : 'text-gray-900'}`}>{amountDisplay}</p>
                    {isRemediatable(tx) && (
                         <button onClick={() => onRemediate(tx.id)} className="text-sm text-synovus-blue hover:text-synovus-red font-semibold">Re-check Status</button>
                    )}
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 shadow-md rounded-lg">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-synovus-dark-gray">Activity</h1>
        </div>
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Activity</h2>
                {pendingTransactions.length > 0 ? (
                    <div className="space-y-4">
                        {pendingTransactions.map(tx => <TransactionCard key={tx.id} tx={tx} />)}
                    </div>
                ) : (
                    <p className="text-gray-500">No pending tasks for you to take action on.</p>
                )}
            </div>
             <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Past Activity</h2>
                 {pastTransactions.length > 0 ? (
                    <div className="space-y-4">
                        {pastTransactions.map(tx => <TransactionCard key={tx.id} tx={tx} />)}
                    </div>
                ) : (
                    <p className="text-gray-500">No past activity to show.</p>
                )}
            </div>
        </div>
    </div>
  );
};
