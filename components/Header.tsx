import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-synovus-red shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <span className="text-white text-2xl font-bold tracking-wider">
              SYNOVUS
            </span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a 
                href="#" 
                className="bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium" 
                aria-current="page"
                onClick={(e) => e.preventDefault()}
              >
                Payments
              </a>
              <a 
                href="#" 
                className="text-red-200 opacity-75 cursor-not-allowed px-3 py-2 rounded-md text-sm font-medium" 
                title="This feature is not available in this demo"
                onClick={(e) => e.preventDefault()}
              >
                Accounts
              </a>
              <a 
                href="#" 
                className="text-red-200 opacity-75 cursor-not-allowed px-3 py-2 rounded-md text-sm font-medium" 
                title="This feature is not available in this demo"
                onClick={(e) => e.preventDefault()}
              >
                Transfers
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};