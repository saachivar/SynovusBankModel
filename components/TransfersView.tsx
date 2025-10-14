import React, { useState } from 'react';

const mockAccounts = [
    { id: 'checking-1234', name: 'Checking (...1234)', balance: 5420.50 },
    { id: 'savings-5678', name: 'Savings (...5678)', balance: 12890.15 },
];

export const TransfersView: React.FC = () => {
    const [fromAccount, setFromAccount] = useState(mockAccounts[0].id);
    const [toAccount, setToAccount] = useState(mockAccounts[1].id);
    const [amount, setAmount] = useState('100.00');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

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
        setSuccessMessage('');

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid amount greater than zero.');
            return;
        }

        if (fromAccount === toAccount) {
            setError('"From" and "To" accounts cannot be the same.');
            return;
        }

        const fromAccountBalance = mockAccounts.find(acc => acc.id === fromAccount)?.balance ?? 0;
        if (numericAmount > fromAccountBalance) {
            setError('Insufficient funds in the selected account.');
            return;
        }

        // Simulate transfer
        console.log(`Transferring $${numericAmount} from ${fromAccount} to ${toAccount}`);
        setSuccessMessage(`Successfully transferred ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericAmount)}!`);
    };

    const handleNewTransfer = () => {
        setSuccessMessage('');
        setAmount('100.00');
        setError('');
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8">
                <h1 className="text-2xl font-bold text-synovus-dark-gray text-center mb-6">Transfer Funds</h1>
                
                {successMessage ? (
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Transfer Complete</h3>
                        <p className="mt-2 text-sm text-gray-500">{successMessage}</p>
                        <div className="mt-6">
                            <button
                                onClick={handleNewTransfer}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Make Another Transfer
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="fromAccount" className="block text-sm font-medium text-gray-700">From Account</label>
                            <select
                                id="fromAccount"
                                name="fromAccount"
                                value={fromAccount}
                                onChange={(e) => setFromAccount(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                            >
                                {mockAccounts.map(account => (
                                    <option key={account.id} value={account.id}>{account.name} - {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(account.balance)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="toAccount" className="block text-sm font-medium text-gray-700">To Account</label>
                            <select
                                id="toAccount"
                                name="toAccount"
                                value={toAccount}
                                onChange={(e) => setToAccount(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                            >
                                {mockAccounts.map(account => (
                                    <option key={account.id} value={account.id}>{account.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
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
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">USD</span>
                                </div>
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}
                        
                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Transfer Funds
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
