import React from 'react';

const mockTransactions = [
  { id: 1, date: '2024-07-29', description: 'Grocery Store Purchase', amount: -75.43 },
  { id: 2, date: '2024-07-28', description: 'Direct Deposit - Paycheck', amount: 2105.50 },
  { id: 3, date: '2024-07-27', description: 'Gas Station', amount: -45.12 },
  { id: 4, date: '2024-07-26', description: 'Online Shopping - Amazon', amount: -123.99 },
  { id: 5, date: '2024-07-25', description: 'Zelle Transfer from Jane Doe', amount: 50.00 },
  { id: 6, date: '2024-07-24', description: 'Monthly Streaming Service', amount: -15.99 },
];

export const AccountsView: React.FC = () => {
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
              This is where your account summaries, balances, and transaction histories would be displayed.
            </p>
        </div>

        <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Transaction History</h2>
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
                        {mockTransactions.map((transaction) => (
                            <tr key={transaction.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${transaction.amount > 0 ? 'text-synovus-green' : 'text-synovus-red'}`}>
                                    {formatCurrency(transaction.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
};