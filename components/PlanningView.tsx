import React from 'react';

const PlanningCard: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
    <h3 className="text-lg font-bold text-synovus-dark-gray mb-4">{title}</h3>
    {children}
  </div>
);

const ProgressBar: React.FC<{ value: number; color: string; }> = ({ value, color }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5">
    <div className={`${color} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
  </div>
);

export const PlanningView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto bg-white p-6 md:p-8 shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-synovus-dark-gray mb-6">Financial Planning</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Savings Goals */}
        <PlanningCard title="Savings Goals">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-semibold text-gray-700">🏖️ Vacation Fund</span>
                <span className="text-sm text-gray-500">75% Complete</span>
              </div>
              <ProgressBar value={75} color="bg-green-500" />
              <p className="text-right text-xs text-gray-500 mt-1">$3,750 of $5,000</p>
            </div>
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-semibold text-gray-700">🚗 New Car</span>
                <span className="text-sm text-gray-500">40% Complete</span>
              </div>
              <ProgressBar value={40} color="bg-blue-500" />
              <p className="text-right text-xs text-gray-500 mt-1">$8,000 of $20,000</p>
            </div>
            <button className="text-synovus-cyan-button font-bold text-sm">+ Create New Goal</button>
          </div>
        </PlanningCard>
        
        {/* Monthly Budgets */}
        <PlanningCard title="Monthly Budgets">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-semibold text-gray-700">Overall Budget</span>
                <span className="text-sm text-gray-500">On Track</span>
              </div>
              <ProgressBar value={55} color="bg-green-500" />
              <p className="text-right text-xs text-gray-500 mt-1">$1,927 of $3,500 spent</p>
            </div>
            <div>
               <p className="text-sm font-semibold text-gray-600 mb-2">Top Categories:</p>
               <div className="space-y-3 text-xs">
                    <p>Groceries: $310 / $500</p>
                    <p>Dining: $220 / $300 (Nearing limit)</p>
                    <p>Shopping: $310 / $400</p>
               </div>
            </div>
             <button className="text-synovus-cyan-button font-bold text-sm">Manage Budgets</button>
          </div>
        </PlanningCard>

        {/* Retirement */}
         <div className="md:col-span-2">
            <PlanningCard title="Retirement Savings">
                 <div className="flex items-center justify-between">
                     <div>
                        <p className="text-sm text-gray-500">Total Balance</p>
                        <p className="text-3xl font-bold text-gray-800">$125,480.00</p>
                        <p className="text-sm text-green-600 font-semibold">+ $1,200 this month</p>
                     </div>
                     <div className="text-center">
                        <p className="text-sm text-gray-500">On Track for Retirement Goal</p>
                        <p className="text-4xl">✅</p>
                     </div>
                 </div>
            </PlanningCard>
        </div>

      </div>
    </div>
  );
};
