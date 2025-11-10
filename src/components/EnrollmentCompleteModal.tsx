import React from 'react';

interface EnrollmentCompleteModalProps {
  onClose: () => void;
}

const CheckIcon: React.FC = () => (
    <svg className="h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
);

export const EnrollmentCompleteModal: React.FC<EnrollmentCompleteModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm text-center p-6">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
            <CheckIcon />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Enrollment Successful!</h2>
        <p className="text-sm text-gray-600 mt-2">
          You have successfully enrolled in Online Bill Pay. You can now manage payees and schedule payments from the Payments tab.
        </p>
        <button
          onClick={onClose}
          className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-synovus-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go to Payments
        </button>
      </div>
    </div>
  );
};