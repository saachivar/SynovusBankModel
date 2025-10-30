import React, { useState, useEffect, useRef } from 'react';
import { Tab } from '../App';

interface HeaderProps {
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
  userName: string;
  onShowAlerts: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onNavigate, userName, onShowAlerts }) => {
  const [messagesOpen, setMessagesOpen] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setMessagesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs: { name: string; key: Tab }[] = [
    { name: 'Accounts', key: 'ACCOUNTS' },
    { name: 'Payments', key: 'PAYMENTS' },
    { name: 'Transfers', key: 'TRANSFERS' },
    { name: 'Insights', key: 'INSIGHTS' },
    { name: 'Planning', key: 'PLANNING' },
    { name: 'FAQs & Support', key: 'FAQS_SUPPORT' },
  ];

  const getTabClassName = (tabKey: Tab) => {
    const baseClasses = "text-white px-3 py-2 text-sm font-bold cursor-pointer transition-opacity duration-200";
    if (activeTab === tabKey) {
      return `${baseClasses} opacity-100 border-b-2 border-white`;
    }
    return `${baseClasses} opacity-80 hover:opacity-100`;
  };

  const headerBgStyle = {
    backgroundImage: `repeating-linear-gradient(
      -20deg,
      transparent,
      transparent 8px,
      rgba(255, 255, 255, 0.03) 8px,
      rgba(255, 255, 255, 0.03) 9px
    )`,
    backgroundColor: '#3a3d42'
  };

  const handleLogout = () => {
    alert('Logout clicked - this would redirect to login page');
  };

  // Get yesterday's date
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return yesterday.toLocaleDateString('en-US', options);
  };

  // Generate random time between 8 AM and 8 PM
  const getRandomTime = () => {
    const hour = Math.floor(Math.random() * 12) + 8; // 8 to 19 (8 AM to 8 PM)
    const minute = Math.floor(Math.random() * 60);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  const lastLogin = `${getYesterdayDate()} at ${getRandomTime()} EST`;

  return (
    <header className="shadow-md relative">
      <div className="text-white relative" style={headerBgStyle}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-24 relative">
                 <div className="flex-shrink-0 self-start pt-5">
                    <span className="text-white text-xl font-bold font-serif tracking-widest">
                        SYNOVUS
                    </span>
                 </div>
                 <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
                    <p className="text-base text-gray-300">Welcome back,</p>
                    <p className="text-2xl font-bold text-white">{userName.toUpperCase()}</p>
                 </div>
                 <div className="text-xs self-start pt-5">
                    <div className="flex items-center space-x-3">
                        <div ref={messagesRef} className="relative">
                            <button onClick={() => setMessagesOpen(!messagesOpen)} className="flex items-center hover:text-gray-300 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <span className="ml-1">Messages</span>
                            </button>
                            {messagesOpen && (
                                <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-20 border text-gray-800">
                                    <div className="p-4 border-b font-bold text-sm">Messages</div>
                                    <div className="p-8 text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0l-8-4-8 4m16 0l-8 4-8-4" /></svg>
                                        <p className="text-sm font-semibold text-gray-600 mt-2">Your inbox is empty</p>
                                        <p className="text-xs text-gray-400">New messages will appear here.</p>
                                    </div>
                                    <div className="p-2 border-t bg-gray-50 text-right">
                                        <button className="text-xs text-synovus-cyan-button font-semibold">Go to Inbox</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={onShowAlerts} className="flex items-center hover:text-gray-300 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            <span className="ml-1">Alerts</span>
                        </button>
                         <div className="border-l border-gray-600 h-3"></div>
                        <div className="flex items-center">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            <span className="ml-1 font-bold">{userName.toUpperCase()}</span>
                        </div>
                    </div>
                    <div className="text-right mt-1.5 text-gray-500">
                        <span className="text-xxs">Last login: {lastLogin}</span>
                        <button onClick={handleLogout} className="ml-3 hover:text-gray-300 transition-colors flex items-center justify-end text-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            Logout
                        </button>
                    </div>
                 </div>
            </div>
        </div>
      </div>
      <div className="bg-synovus-red">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-baseline justify-center h-12">
                 <div className="flex items-baseline space-x-8">
                   {tabs.map(tab => (
                     <button key={tab.key} onClick={() => onNavigate(tab.key)} className={getTabClassName(tab.key)} aria-current={activeTab === tab.key ? 'page' : undefined}>
                        {tab.name}
                     </button>
                  ))}
                </div>
            </nav>
          </div>
      </div>
    </header>
  );
};
