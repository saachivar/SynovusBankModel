import React, { useState, useEffect } from 'react';
// Correcting import path for Account type
import { Account } from '../App.tsx';

interface PaymentFormProps {
  accounts: Account[];
  onPay: (fromId: string, amount: number) => void;
}

const payees = [
    { id: 'power', name: 'City Power & Light' },
    { id: 'gas', name: 'State Gas Co.' },
    { id: 'internet', name: 'Internet Provider' },
    { id: 'water', name: 'Municipal Water' },
];

export const PaymentForm: React.FC<PaymentFormProps> = ({ accounts, onPay }) => {
  const [fromAccount, setFromAccount] = useState(accounts[0]?.id || '');
  const [payee, setPayee] = useState(payees[0]?.id || '');
  const [amount, setAmount] = useState('25.00');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!fromAccount && accounts[0]) {
      setFromAccount(accounts[0].id);
    }
  }, [accounts, fromAccount]);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]*\.?[0-9]{0,2}$/.test(value)) {
      setAmount(value);
      if (error) setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }
    
    const selectedAccount = accounts.find(acc => acc.id === fromAccount);
    if (!selectedAccount) {
        setError('Please select a valid account.');
        return;
    }

    if (numericAmount > selectedAccount.balance) {
      setError('Insufficient funds for this payment.');
      return;
    }
    
    onPay(fromAccount, numericAmount);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div>
        <label htmlFor="fromAccount" className="block text-sm font-medium text-gray-700">
          From Account
        </label>
        <select
          id="fromAccount"
          name="fromAccount"
          value={fromAccount}
          onChange={(e) => setFromAccount(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
        >
          {accounts.map(account => (
            <option key={account.id} value={account.id}>
              {account.name} - {formatCurrency(account.balance)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="payee" className="block text-sm font-medium text-gray-700">
          Payee
        </label>
        <select
          id="payee"
          name="payee"
          value={payee}
          onChange={(e) => setPayee(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
        >
          {payees.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Payment Amount
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="text"
            name="amount"
            id="amount"
            className="focus:ring-red-500 focus:border-red-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
            placeholder="0.00"
            value={amount}
            onChange={handleAmountChange}
            aria-describedby="amount-currency"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm" id="amount-currency">
              USD
            </span>
          </div>
        </div>
      </div>
      
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Pay Bill
        </button>
      </div>
    </form>
  );
};