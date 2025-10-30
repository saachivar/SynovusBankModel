import React, { useState, useEffect, useRef } from 'react';
import { Tab } from '../types.ts';

export interface AlertBannerType {
  id: number;
  visible: boolean;
  type: 'reminder' | 'info';
  title: string;
  message: string;
  actionText: string;
  action: () => void;
}

interface HeaderProps {
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
  userName: string;
  alerts: AlertBannerType[];
  onDismissAlert: (id: number) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onNavigate, userName, alerts, onDismissAlert, onLogout }) => {
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setMessagesOpen(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setAlertsOpen(false);
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
  
  const lastLogin = "Wednesday, October 29, 2025 at 8:47 AM EST";
  const visibleAlerts = alerts.filter(a => a.visible);

  return (
    <header className="shadow-md relative">
      <div className="text-white" style={headerBgStyle}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-24">
                 {/* Left Column */}
                 <div className="flex-1">
                    <span className="text-white text-2xl font-bold font-serif tracking-widest">
                        SYNOVUS
                    </span>
                 </div>
                 
                 {/* Center Column */}
                 <div className="flex-1 text-center">
                    <p className="text-base text-gray-300">Welcome back,</p>
                    <p className="text-2xl font-bold text-white">{userName.toUpperCase()}</p>
                 </div>

                 {/* Right Column */}
                 <div className="flex-1 text-right text-xs">
                    <div className="flex items-center justify-end space-x-3">
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
                        <div ref={alertsRef} className="relative">
                            <button onClick={() => setAlertsOpen(!alertsOpen)} className="flex items-center hover:text-gray-300 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                <span className="ml-1">Alerts</span>
                                {visibleAlerts.length > 0 && (
                                    <span className="ml-1.5 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold">{visibleAlerts.length}</span>
                                )}
                            </button>
                            {alertsOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 border text-gray-800">
                                    <div className="p-4 border-b font-bold text-sm">Your Alerts</div>
                                    {visibleAlerts.length > 0 ? (
                                        <div className="max-h-80 overflow-y-auto">
                                            {visibleAlerts.map(alert => (
                                                <div key={alert.id} className="p-3 border-b border-gray-100 last:border-b-0">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold text-gray-800 text-sm">{alert.title}</p>
                                                            <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                                                        </div>
                                                        <button onClick={() => onDismissAlert(alert.id)} className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0" aria-label={`Dismiss alert: ${alert.title}`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                    <button onClick={() => { alert.action(); setAlertsOpen(false); }} className="text-xs font-bold text-synovus-cyan-button hover:underline mt-2">
                                                        {alert.actionText}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <p className="text-sm font-semibold text-gray-600 mt-2">No new alerts</p>
                                            <p className="text-xs text-gray-400">We'll let you know when something comes up.</p>
                                        </div>
                                    )}
                                    <div className="p-2 border-t bg-gray-50 text-right">
                                        <button className="text-xs text-synovus-cyan-button font-semibold">Manage Alerts</button>
                                    </div>
                                </div>
                            )}
                        </div>
                         <div className="border-l border-gray-600 h-3"></div>
                        <div className="flex items-center">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            <span className="ml-1 font-bold">{userName.toUpperCase()}</span>
                        </div>
                        <button onClick={onLogout} className="flex items-center hover:text-gray-300 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          <span className="ml-1">Sign Out</span>
                        </button>
                    </div>
                    <div className="text-right mt-1.5 text-gray-400">
                        <span className="text-xxs">Last login: {lastLogin}</span>
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