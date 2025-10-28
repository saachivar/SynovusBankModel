import React from 'react';
import { Account } from '../../App'; // Import the shared Account type

interface AccountsViewProps {
    accounts: Account[];
}

export const AccountsView: React.FC<AccountsViewProps> = ({ accounts }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-8">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-synovus-dark-gray">Accounts Overview</h1>
            <p className="mt-4 text-gray-600">
              Your account summaries and current balances. For a detailed transaction history, please visit the Activity tab.
            </p>
        </div>

        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Balances</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {accounts.map(account => (
                    <div key={account.id} className="bg-synovus-gray p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-700">{account.name}</h3>
                        <p className="text-3xl font-bold text-synovus-blue mt-2">{formatCurrency(account.balance)}</p>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};