import React, { useState } from 'react';
import { Account } from '../App';

interface EnrollBillPayModalProps {
  accounts: Account[];
  onClose: () => void;
  onSubmit: () => void;
}

export const EnrollBillPayModal: React.FC<EnrollBillPayModalProps> = ({ accounts, onClose, onSubmit }) => {
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (agreed) {
      onSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Enroll in Online Bill Pay</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          <p className="text-sm text-gray-600">
            Pay bills quickly and securely from one place. Set up one-time or recurring payments and never miss a due date again.
          </p>
          <div>
            <h3 className="block text-sm font-medium text-gray-700 mb-2">
              Select a Primary Payment Account
            </h3>
            <div className="space-y-2">
                {accounts.map(account => (
                    <label key={account.id} className="flex items-center p-3 border rounded-md cursor-pointer has-[:checked]:bg-red-50 has-[:checked]:border-synovus-red">
                        <input
                            type="radio"
                            name="payment-account"
                            value={account.id}
                            checked={selectedAccountId === account.id}
                            onChange={() => setSelectedAccountId(account.id)}
                            className="h-4 w-4 text-synovus-red focus:ring-synovus-red border-gray-300"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-800">{account.name}</span>
                    </label>
                ))}
            </div>
          </div>
          <div>
            <label className="flex items-start space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
                className="mt-0.5 h-4 w-4 text-synovus-red focus:ring-synovus-red border-gray-300 rounded flex-shrink-0"
              />
              <span className="text-sm text-gray-700">
                I have read and agree to the <a href="#" className="text-synovus-blue hover:underline">Bill Pay Terms of Service</a>.
              </span>
            </label>
          </div>
        </form>
        <div className="p-4 mt-auto border-t flex-shrink-0 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-synovus-blue hover:bg-opacity-90 disabled:bg-gray-400"
            disabled={!agreed}
          >
            Confirm Enrollment
          </button>
        </div>
      </div>
    </div>
  );
};