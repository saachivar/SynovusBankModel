import React, { useState } from 'react';

type Tab = 'ACCOUNTS' | 'PAYMENTS' | 'TRANSFERS' | 'SEND_RECEIVE';

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs: { name: string; key: Tab }[] = [
    { name: 'Accounts', key: 'ACCOUNTS' },
    { name: 'Payments', key: 'PAYMENTS' },
    { name: 'Transfers', key: 'TRANSFERS' },
    { name: 'Send & Receive', key: 'SEND_RECEIVE' },
  ];

  const getDesktopTabClassName = (tabKey: Tab) => {
    if (activeTab === tabKey) {
      return "text-synovus-red border-b-4 border-synovus-red px-3 py-2 text-lg font-bold";
    }
    return "text-gray-500 hover:text-synovus-red px-3 py-2 text-lg font-medium cursor-pointer";
  };

  const getMobileTabClassName = (tabKey: Tab) => {
    if (activeTab === tabKey) {
      return "bg-red-50 text-synovus-red block px-3 py-2 rounded-md text-base font-medium";
    }
    return "text-gray-600 hover:bg-gray-100 hover:text-gray-800 block px-3 py-2 rounded-md text-base font-medium cursor-pointer";
  };
  
  const handleMobileLinkClick = (tabKey: Tab) => {
    onTabChange(tabKey);
    setIsMobileMenuOpen(false);
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
          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
               {tabs.map(tab => (
                 <a key={tab.key} onClick={() => onTabChange(tab.key)} className={getDesktopTabClassName(tab.key)} aria-current={activeTab === tab.key ? 'page' : undefined}>
                    {tab.name}
                 </a>
              ))}
            </div>
          </nav>
          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-synovus-red"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {tabs.map(tab => (
              <a key={tab.key} onClick={() => handleMobileLinkClick(tab.key)} className={getMobileTabClassName(tab.key)} aria-current={activeTab === tab.key ? 'page' : undefined}>
                {tab.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};