import React from 'react';
import { Transaction } from '../types.ts';

interface RemediationResultModalProps {
  result: {
    status: 'SUCCESS' | 'FAILED';
    tx: Transaction;
  } | null;
  onClose: () => void;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`h-12 w-12 text-green-500 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
);
  
const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`h-12 w-12 text-red-500 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const RemediationResultModal: React.FC<RemediationResultModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  const isSuccess = result.status === 'SUCCESS';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm text-center p-6">
        <h2 className="text-xl font-bold text-gray-800">Re-check Complete</h2>
        
        <div className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-red-100'} my-4`}>
          {isSuccess ? <CheckIcon /> : <XIcon />}
        </div>
        
        <h3 className={`text-lg font-semibold ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
            Transaction was actually a {isSuccess ? 'Success' : 'Failure'}
        </h3>
        
        <p className="text-sm text-gray-600 mt-2">
            {isSuccess ?
                <span>The status for transaction <code className="text-xs bg-gray-100 p-1 rounded">{result.tx.id.slice(0, 8)}...</code> has been updated. Your account balances have been corrected.</span>
                :
                <span>The transaction <code className="text-xs bg-gray-100 p-1 rounded">{result.tx.id.slice(0, 8)}...</code> was confirmed as failed and has been removed from your activity. No changes were made to your accounts.</span>
            }
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-synovus-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          OK
        </button>
      </div>
    </div>
  );
};