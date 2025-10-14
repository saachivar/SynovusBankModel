import React from 'react';
import { Account } from '../../App'; // Import the shared Account type
import { Transaction } from '../types';

interface AccountsViewProps {
    accounts: Account[];
    transactions: Transaction[];
}

export const AccountsView: React.FC<AccountsViewProps> = ({ accounts, transactions }) => {
  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0;
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));

    return isNegative ? `-${formattedAmount}` : formattedAmount;
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-8">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-synovus-dark-gray">Accounts Overview</h1>
            <p className="mt-4 text-gray-600">
              Your account summaries, balances, and transaction histories.
            </p>
        </div>

        <div className="mb-10">
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

        <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.length > 0 ? (
                            transactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${transaction.amount >= 0 ? 'text-synovus-green' : 'text-synovus-red'}`}>
                                        {formatCurrency(transaction.amount)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500">
                                    No transactions yet. Make a payment or transfer to see it here.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
};
