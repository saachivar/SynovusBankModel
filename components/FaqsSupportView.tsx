import React, { useState } from 'react';

const faqs = [
  {
    question: 'How do I reset my My Synovus password?',
    answer: 'On the login page, click the "Forgot Your Password?" link. You will be prompted to enter your username and other verification details. A temporary password will be sent to your registered email address or phone number.'
  },
  {
    question: 'How do I set up account alerts?',
    answer: 'Once logged in, navigate to the "Alerts" section in your profile. From there, you can create new alerts for balance thresholds, specific transactions, and more. You can choose to receive alerts via email, text message, or push notification.'
  },
  {
    question: 'What are the limits for mobile deposit?',
    answer: 'Mobile deposit limits vary based on your account history and type. To view your specific limits, open the mobile app, go to the "Deposit" screen, and your daily and monthly limits will be displayed.'
  },
  {
    question: 'How can I find my full account and routing number?',
    answer: 'Select an account from the main "Accounts" page. On the account details screen, you will see an option to "Show account details" which will reveal your full account and routing numbers after a security verification step.'
  },
];

const FaqItem: React.FC<{ faq: { question: string; answer: string }; isOpen: boolean; onClick: () => void; }> = ({ faq, isOpen, onClick }) => (
    <div className="border-b">
        <button onClick={onClick} className="flex justify-between items-center w-full py-4 text-left">
            <span className="font-semibold text-gray-800">{faq.question}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        {isOpen && (
            <div className="pb-4 pr-4 text-gray-600">
                {faq.answer}
            </div>
        )}
    </div>
);


export const FaqsSupportView: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

  return (
    <div className="max-w-7xl mx-auto bg-white p-6 md:p-8 shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-synovus-dark-gray mb-6">FAQs & Support</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
                {faqs.map((faq, index) => (
                    <FaqItem 
                        key={index} 
                        faq={faq}
                        isOpen={openIndex === index}
                        onClick={() => handleToggle(index)}
                    />
                ))}
            </div>
        </div>
        <div>
            <div className="bg-gray-50 border rounded-lg p-6">
                 <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Us</h2>
                 <div className="space-y-4">
                     <div>
                        <h3 className="font-bold text-gray-700">Synovus Customer Care</h3>
                        <p className="text-synovus-blue font-bold text-lg">1-888-SYNOVUS (796-6887)</p>
                        <p className="text-sm text-gray-600">Available 24/7 for general support.</p>
                     </div>
                      <div>
                        <h3 className="font-bold text-gray-700">Online Banking Support</h3>
                        <p className="text-synovus-blue font-bold text-lg">1-888-796-6887, option 3</p>
                        <p className="text-sm text-gray-600">Specialized support for My Synovus.</p>
                     </div>
                      <div>
                        <h3 className="font-bold text-gray-700">Email</h3>
                        <a href="mailto:info@synovus.com" className="text-synovus-blue hover:underline">info@synovus.com</a>
                        <p className="text-sm text-gray-600">For general, non-sensitive inquiries.</p>
                     </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};
