import React, { useState, useEffect } from 'react';

interface AlertsModalProps {
  onClose: () => void;
}

const alerts = [
  { id: 1, type: 'warning', title: 'Low Balance Alert', description: 'Your Synovus Checking (...4321) is below your set threshold of $500.', timestamp: '1 day ago' },
  { id: 2, type: 'info', title: 'Large Withdrawal', description: 'A withdrawal of $1,500.00 was made from Synovus Savings (...8765).', timestamp: '3 days ago' },
  { id: 3, type: 'success', title: 'Transfer Complete', description: 'Your transfer of $100.00 to Synovus Checking was successful.', timestamp: '6 days ago' },
];

const AlertIcon: React.FC<{ type: string }> = ({ type }) => {
    switch (type) {
        case 'warning':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
        case 'info':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'success':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        default:
            return null;
    }
};

export const AlertsModal: React.FC<AlertsModalProps> = ({ onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Delay visibility to allow for CSS transition
        requestAnimationFrame(() => setIsVisible(true));
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for transition to finish before unmounting
    };

  return (
    <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <div 
            className={`fixed inset-0 bg-black transition-opacity duration-300 ${isVisible ? 'bg-opacity-60' : 'bg-opacity-0'}`}
            onClick={handleClose}
        ></div>

        {/* Slider Panel */}
        <div className={`fixed top-0 right-0 h-full bg-white shadow-2xl w-full max-w-md flex flex-col transition-transform duration-300 ease-in-out ${isVisible ? 'transform translate-x-0' : 'transform translate-x-full'}`}>
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">Your Alerts</h2>
              <button onClick={handleClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 flex-grow">
              {alerts.map(alert => (
                <div key={alert.id} className="flex items-start p-4 rounded-md bg-gray-50 border">
                    <div className="flex-shrink-0 mr-4">
                        <AlertIcon type={alert.type} />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">{alert.title}</p>
                        <p className="text-sm text-gray-600">{alert.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{alert.timestamp}</p>
                    </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Manage Alert Settings
              </button>
            </div>
        </div>
    </div>
  );
};
