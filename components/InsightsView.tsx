import React from 'react';

const InsightCard: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
    <div className="flex items-center mb-3">
      {icon && <div className="mr-3 text-synovus-blue">{icon}</div>}
      <h3 className="text-md font-bold text-synovus-dark-gray">{title}</h3>
    </div>
    {children}
  </div>
);

const spendingData = [
    { category: 'Groceries', amount: 450.75, color: 'bg-green-500' },
    { category: 'Dining Out', amount: 220.50, color: 'bg-orange-500' },
    { category: 'Utilities', amount: 185.25, color: 'bg-blue-500' },
    { category: 'Shopping', amount: 310.80, color: 'bg-purple-500' },
    { category: 'Other', amount: 150.00, color: 'bg-gray-400' },
];

const totalSpending = spendingData.reduce((acc, item) => acc + item.amount, 0);

export const InsightsView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto bg-white p-6 md:p-8 shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-synovus-dark-gray mb-6">Financial Insights</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Monthly Cash Flow Card */}
        <div className="lg:col-span-2">
            <InsightCard title="This Month's Cash Flow">
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">Income</span>
                            <span className="font-bold text-green-600">$5,200.00</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div className="bg-green-500 h-4 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">Spending</span>
                             <span className="font-bold text-red-600">${totalSpending.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div className="bg-red-500 h-4 rounded-full" style={{ width: `${(totalSpending / 5200) * 100}%`}}></div>
                        </div>
                    </div>
                </div>
            </InsightCard>
        </div>

        {/* Spending Breakdown Card */}
        <InsightCard title="Spending by Category">
            <div className="space-y-3">
                {spendingData.map(item => (
                    <div key={item.category}>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${item.color}`}></div>
                                <span className="text-gray-700">{item.category}</span>
                            </div>
                            <span className="font-medium text-gray-800">${item.amount.toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </InsightCard>

        {/* Recent Insights Card */}
        <div className="lg:col-span-3">
            <InsightCard title="Recent Insights">
                <ul className="space-y-3">
                    <li className="flex items-start p-3 bg-white rounded-md border">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-4 flex-shrink-0">
                            <span className="text-lg">⚠️</span>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">Unusual Spending Alert</p>
                            <p className="text-sm text-gray-600">Your spending on <span className="font-bold">Shopping</span> is up 35% this month compared to your average.</p>
                        </div>
                    </li>
                    <li className="flex items-start p-3 bg-white rounded-md border">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                             <span className="text-lg">🗓️</span>
                        </div>
                        <div>
                             <p className="font-semibold text-gray-800">Upcoming Bill</p>
                            <p className="text-sm text-gray-600">Your payment of <span className="font-bold">$75.50</span> to <span className="font-bold">City Power & Light</span> is due in 3 days.</p>
                        </div>
                    </li>
                     <li className="flex items-start p-3 bg-white rounded-md border">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-4 flex-shrink-0">
                             <span className="text-lg">📈</span>
                        </div>
                        <div>
                             <p className="font-semibold text-gray-800">Positive Trend</p>
                            <p className="text-sm text-gray-600">Great job! You've saved <span className="font-bold">$250 more</span> this month than you did last month.</p>
                        </div>
                    </li>
                </ul>
            </InsightCard>
        </div>
      </div>
    </div>
  );
};
