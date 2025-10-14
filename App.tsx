import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PaymentsView } from './components/PaymentsView';
import { AccountsView } from './components/AccountsView';
import { TransfersView } from './components/TransfersView';

type Tab = 'ACCOUNTS' | 'PAYMENTS' | 'TRANSFERS';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('PAYMENTS');

  const renderContent = () => {
    switch (activeTab) {
      case 'ACCOUNTS':
        return <AccountsView />;
      case 'PAYMENTS':
        return <PaymentsView />;
      case 'TRANSFERS':
        return <TransfersView />;
      default:
        return <PaymentsView />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
