import React from 'react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: 'ACCOUNTS' | 'PAYMENTS' | 'TRANSFERS' | 'SEND_RECEIVE') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const getTabClassName = (tabName: string) => {
    if (activeTab === tabName) {
      return "text-synovus-red border-b-4 border-synovus-red px-3 py-2 text-lg font-bold";
    }
    return "text-gray-500 hover:text-synovus-red px-3 py-2 text-lg font-medium cursor-pointer";
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <div className="inline-block">
              <span className="text-synovus-red text-4xl font-bold font-serif tracking-wider">
                SYNOVUS<sup className="text-xl font-bold top-[-0.6em] relative">®</sup>
              </span>
              <p className="text-synovus-red text-xl italic text-right -mt-1">
                the bank of here
              </p>
            </div>
          </div>
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a onClick={() => onTabChange('ACCOUNTS')} className={getTabClassName('ACCOUNTS')}>
                Accounts
              </a>
              <a onClick={() => onTabChange('PAYMENTS')} className={getTabClassName('PAYMENTS')} aria-current={activeTab === 'PAYMENTS' ? 'page' : undefined}>
                Payments
              </a>
              <a onClick={() => onTabChange('TRANSFERS')} className={getTabClassName('TRANSFERS')}>
                Transfers
              </a>
              <a onClick={() => onTabChange('SEND_RECEIVE')} className={getTabClassName('SEND_RECEIVE')}>
                Send &amp; Receive
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
