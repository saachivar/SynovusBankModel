import React from 'react';

export interface AlertBannerType {
  id: number;
  visible: boolean;
  type: 'reminder' | 'info';
  title: string;
  message: string;
  actionText: string;
  action: () => void;
}

interface AlertBannersProps {
  alerts: AlertBannerType[];
  onDismiss: (id: number) => void;
}

const AlertIcon: React.FC<{ type: 'reminder' | 'info' }> = ({ type }) => {
  if (type === 'reminder') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};


export const AlertBanners: React.FC<AlertBannersProps> = ({ alerts, onDismiss }) => {
  const visibleAlerts = alerts.filter(a => a.visible);

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {visibleAlerts.map(alert => (
        <div key={alert.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start md:items-center justify-between gap-4">
            <div className="flex-shrink-0">
                <AlertIcon type={alert.type} />
            </div>
            <div className="flex-grow">
                <h3 className="font-bold text-blue-800">{alert.title}</h3>
                <p className="text-sm text-blue-700">{alert.message}</p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
                 <button onClick={alert.action} className="text-sm font-bold text-blue-600 hover:text-blue-800 whitespace-nowrap">
                    {alert.actionText}
                </button>
                <button onClick={() => onDismiss(alert.id)} className="text-blue-400 hover:text-blue-600" aria-label={`Dismiss alert: ${alert.title}`}>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
      ))}
    </div>
  );
};