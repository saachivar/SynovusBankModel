// components/StatusDisplay.tsx

import React from 'react';
import { TransactionStatus } from '../types.ts';

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
  const isFinalState = 
    status === TransactionStatus.SUCCESS || 
    status === TransactionStatus.FAILED ||
    status === TransactionStatus.SUCCESS_AFTER_PENDING ||
    status === TransactionStatus.FAILED_AFTER_PENDING;

  switch (status) {
    case TransactionStatus.PROCESSING:
      content = (
        <div className="text-center">
          <SpinnerIcon className="mx-auto mb-4" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">Processing Securely</h3>
          <p className="mt-2 text-sm text-gray-500">Your transaction is being securely processed. We will update the status here momentarily.</p>
        </div>
      );
      break;
    case TransactionStatus.PENDING_CONFIRMATION:
      content = (
        <div className="text-center">
          <SpinnerIcon className="mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg leading-6 font-medium text-yellow-600">Payment Pending</h3>
          <p className="mt-2 text-sm text-gray-500">Your payment is taking longer than expected to confirm. Your request has been secured and will not be duplicated. The final status will be available in your Activity feed.</p>
        </div>
      );
      break;
    case TransactionStatus.SUCCESS:
    case TransactionStatus.SUCCESS_AFTER_PENDING:
      content = (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckIcon />
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Payment Completed</h3>
          <p className="mt-2 text-sm text-gray-500">Your payment was completed successfully. Your records and balance have been updated.</p>
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
            <p className="mt-2 text-sm text-gray-500">Your payment could not be processed. <strong>Your account has not been charged.</strong> Please verify your details and try again.</p>
          </div>
        );
        break;
    case TransactionStatus.FAILED_AFTER_PENDING:
      content = (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <XIcon />
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Payment Failed</h3>
          <p className="mt-2 text-sm text-gray-500">The payment could not be confirmed. <strong>Your account has not been charged.</strong> You can re-check the status or check your Activity feed later.</p>
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
        <div className="space-y-2">
            {isFinalState && (
              <button
                onClick={onReset}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                {status === TransactionStatus.FAILED_AFTER_PENDING ? 'Return to Terminal' : 'Make Another Payment'}
              </button>
            )}
        </div>
      </div>
    </div>
  );
};