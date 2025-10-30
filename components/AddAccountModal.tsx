import React, { useState } from 'react';

interface AddAccountModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ onClose, onSubmit }) => {
  const [accountType, setAccountType] = useState('checking');
  const [deposit, setDeposit] = useState('100.00');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]*\.?[0-9]{0,2}$/.test(value)) {
      setDeposit(value);
      if (error) setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const numericDeposit = parseFloat(deposit);
    if (isNaN(numericDeposit) || numericDeposit <= 0) {
        setError('Please enter a valid initial deposit amount.');
        return;
    }
    if (!agreed) {
        setError('You must agree to the terms to continue.');
        return;
    }
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Open a New Synovus Account</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">
              Account Type
            </label>
            <select
              id="accountType"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
            >
              <option value="checking">Pro Checking</option>
              <option value="savings">Plus Savings</option>
              <option value="moneyMarket">Money Market Account</option>
            </select>
          </div>
          <div>
            <label htmlFor="deposit" className="block text-sm font-medium text-gray-700">
              Initial Deposit
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="text"
                id="deposit"
                value={deposit}
                onChange={handleDepositChange}
                className="focus:ring-red-500 focus:border-red-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                placeholder="0.00"
              />
            </div>
          </div>
           <div>
              <label className="flex items-start space-x-3 cursor-pointer">
                  <input 
                      type="checkbox" 
                      checked={agreed}
                      onChange={() => setAgreed(!agreed)}
                      className="mt-0.5 h-4 w-4 text-synovus-blue focus:ring-synovus-blue border-gray-300 rounded flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700">I have read and agree to the <a href="#" className="text-synovus-blue hover:underline">Terms and Conditions</a> and the <a href="#" className="text-synovus-blue hover:underline">Account Disclosures</a>.</span>
              </label>
           </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </form>
        <div className="p-4 border-t flex-shrink-0">
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-synovus-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            disabled={!agreed}
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
};
