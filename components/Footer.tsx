import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white">
      <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Synovus Bank. Member FDIC. All rights reserved. This is a demo application.
        </p>
      </div>
    </footer>
  );
};
