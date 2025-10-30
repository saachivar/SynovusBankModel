import React from 'react';
// Correcting import path for Account and Tab types
import { Account, Tab } from '../App.tsx';

interface AccountsViewProps {
    accounts: Account[];
    onNavigate: (tab: Tab) => void;
    onShowZelle: () => void;
    onAddAccount: () => void;
    onEnrollInBillPay: () => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ accounts, onNavigate, onShowZelle, onAddAccount, onEnrollInBillPay }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  const toolButtonBase = "w-full flex justify-between items-center text-left py-3 px-4 border rounded-lg transition-all duration-200 shadow-sm text-sm font-medium";

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white p-6 md:p-8 shadow-lg rounded-lg z-10 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Accounts</h2>
          <a href="#" className="text-sm font-semibold text-synovus-cyan-button flex items-center">
            Account Options
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">
            <div className="lg:col-span-2">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Assets</h3>
                <div className="space-y-0">
                    {accounts.map((account, index) => (
                        <div key={account.id} className={`flex justify-between items-center py-4 ${index < accounts.length - 1 ? 'border-b border-gray-200' : ''}`}>
                           <div>
                                <p className="font-semibold text-gray-800">{account.name.split(' (')[0]}</p>
                                <p className="text-sm text-gray-500">{account.name.match(/\(\.\.\.\d+\)/)?.[0]}</p>
                           </div>
                           <div className="text-right">
                                <p className="text-lg font-bold text-gray-800">{formatCurrency(account.balance)}</p>
                                <p className="text-sm text-gray-500">Available Balance</p>
                           </div>
                        </div>
                    ))}
                </div>
                <button onClick={onAddAccount} className="mt-6 text-synovus-cyan-button border-2 border-synovus-cyan-button rounded-full px-5 py-2 text-sm font-bold hover:bg-cyan-50 transition-colors">
                  Add An Account
                </button>
            </div>
            <div className="lg:col-span-1">
                 <div className="flex items-start mb-4">
                     <span className="font-bold text-sm text-gray-600 mr-2">FDIC</span>
                     <p className="text-xs text-gray-500">FDIC-Insured - Backed by the full faith and credit of the U.S. Government</p>
                 </div>
                 <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-wider">PAY / TRANSFER TOOLS</h3>
                 <div className="space-y-3">
                     <button onClick={() => onNavigate('TRANSFERS')} className={`${toolButtonBase} bg-synovus-cyan-button text-white hover:bg-opacity-90`}>
                        <span>Make a Quick Transfer</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                     </button>
                     <button onClick={() => onNavigate('PAYMENTS')} className={`${toolButtonBase} bg-synovus-cyan-button text-white hover:bg-opacity-90`}>
                        <span>Make a Quick Payment</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </button>
                     <button onClick={onShowZelle} className={`${toolButtonBase} bg-white text-gray-700 hover:border-gray-300 border-gray-200`}>
                        <span className="flex items-center">Send money with 
                            <span className="ml-1.5 font-bold italic text-2xl tracking-tight">
                                zelle<span className="text-zelle-purple text-3xl leading-none font-black">.</span>
                            </span>
                        </span>
                     </button>
                     <button onClick={onEnrollInBillPay} className={`${toolButtonBase} bg-white text-gray-700 hover:border-gray-300 border-gray-200`}>
                        <span>Enroll in bill pay</span>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-synovus-cyan-button" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                     </button>
                 </div>
                 <h3 className="text-xs font-bold text-gray-500 mt-6 mb-3 tracking-wider">Helpful tools</h3>
                 <div className="space-y-3">
                    <button className={`${toolButtonBase.replace('justify-between', 'justify-start')} bg-white hover:border-gray-300 border-gray-200`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-synovus-cyan-button" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <span className="ml-3 text-sm text-gray-700 font-medium">You have 0 unread messages</span>
                    </button>
                     <button className={`${toolButtonBase} bg-white hover:border-gray-300 border-gray-200`}>
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-synovus-cyan-button" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                            <span className="ml-3 text-sm text-gray-700 font-medium">Insights</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};