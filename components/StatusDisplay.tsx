// FIX: Implement the StatusDisplay component to resolve parsing and rendering errors.
import React from 'react';
import { TransactionStatus } from '../types';

interface StatusDisplayProps {
  status: TransactionStatus;
  traceId: string;
  onReset: () => void;
}

const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`animate-spin h-8 w-8 text-gray-700 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`h-6 w-6 text-green-500 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`h-6 w-6 text-red-500 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, traceId, onReset }) => {
  let content;
  const showResetButton = status === TransactionStatus.SUCCESS || status === TransactionStatus.FAILED;

  switch (status) {
    case TransactionStatus.PROCESSING:
      content = (
        <div className="text-center">
          <SpinnerIcon className="mx-auto mb-4" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">Processing Payment</h3>
          <p className="mt-2 text-sm text-gray-500">Your transaction is being processed. Please wait.</p>
        </div>
      );
      break;
    case TransactionStatus.PENDING_CONFIRMATION:
      content = (
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg w-full">
          <SpinnerIcon className="mx-auto mb-4" />
          <h3 className="text-lg leading-6 font-medium text-yellow-800">Awaiting Confirmation</h3>
          <p className="mt-2 text-sm text-gray-600">
            We're still verifying your transaction with the backend. You'll be notified here once it's confirmed.
          </p>
        </div>
      );
      break;
    case TransactionStatus.SUCCESS:
      content = (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckIcon />
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Payment Successful</h3>
          <p className="mt-2 text-sm text-gray-500">Your payment has been completed successfully.</p>
        </div>
      );
      break;
    case TransactionStatus.FAILED:
      content = (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <XIcon />
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Payment Failed</h3>
          <p className="mt-2 text-sm text-gray-500">There was an issue with your payment. Please try again.</p>
        </div>
      );
      break;
    default:
      content = null;
  }

  return (
    <div className="flex flex-col items-center min-h-[218px] w-full">
      <div className="flex-grow w-full flex items-center justify-center">
        {content}
      </div>
      <div className="w-full mt-auto">
        {traceId && (
          <p className="text-xs text-gray-400 text-center mb-4">
            Trace ID: {traceId}
          </p>
        )}
        {showResetButton && (
          <div className="w-full">
            <button
              onClick={onReset}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Make Another Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
