import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';

interface RemediationControlProps {
  remediableTx: Transaction | null;
  onRemediate: (transactionId: string) => void;
}

export const RemediationControl: React.FC<RemediationControlProps> = ({ remediableTx, onRemediate }) => {
  const [isChecking, setIsChecking] = useState(false);

  // Reset checking state if the transaction changes
  useEffect(() => {
    setIsChecking(false);
  }, [remediableTx]);

  if (!remediableTx) {
    return null;
  }

  const handleRemediateClick = () => {
    setIsChecking(true);
    onRemediate(remediableTx.id);
  };

  return (
    <div className="bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-xl p-6 shadow-inner">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
            <h3 className="text-lg font-bold text-yellow-800">Action Required</h3>
            <p className="text-sm text-yellow-700 mt-1">
                A previous transaction failed after being pending. You can re-check its final status with the backend.
            </p>
        </div>
        <button
          onClick={handleRemediateClick}
          disabled={isChecking}
          className="w-full sm:w-auto flex-shrink-0 justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-synovus-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {isChecking ? 'Re-checking...' : 'Re-check Status'}
        </button>
      </div>
    </div>
  );
};
