import React, { useState, useEffect, useMemo } from 'react';
import { TransactionStatus } from '../types';

interface RecipientTracerProps {
  status: TransactionStatus;
  traceId: string;
  amount: number;
  recipientEmail: string;
}

// Icon components for status display
const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`animate-spin h-6 w-6 text-gray-700 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
  
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`h-6 w-6 text-green-600 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
);
  
const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`h-6 w-6 text-red-600 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const ANIMATION_SPEEDS = {
    [TransactionStatus.IDLE]: 750,
    [TransactionStatus.PROCESSING]: 400,
    [TransactionStatus.PENDING_CONFIRMATION]: 400,
    [TransactionStatus.SUCCESS]: 100,
    [TransactionStatus.FAILED]: 100,
    [TransactionStatus.SUCCESS_AFTER_PENDING]: 300,
    [TransactionStatus.FAILED_AFTER_PENDING]: 300,
};

const CodeLine: React.FC<{ children: React.ReactNode; isHighlighted?: boolean }> = ({ children, isHighlighted }) => (
    <div className={`whitespace-pre-wrap transition-colors duration-300 px-2 rounded ${isHighlighted ? 'bg-slate-800' : ''}`}>{children}</div>
);
const Keyword: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-fuchsia-400">{children}</span>;
const Func: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-sky-400">{children}</span>;
const String: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-emerald-400">{children}</span>;
const Comment: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-gray-500">{children}</span>;
const NumberVal: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-orange-400">{children}</span>;

export const RecipientTracerDisplay: React.FC<RecipientTracerProps> = ({ status, traceId, amount, recipientEmail }) => {
    const [currentLine, setCurrentLine] = useState(0);

    const codeSnippets = useMemo(() => ({
        [TransactionStatus.IDLE]: [
            <><Comment>// Listening for incoming payment notifications...</Comment></>,
            <><Keyword>const</Keyword> server = <Func>new PaymentListener</Func>();</>,
            <>server.<Func>on</Func>(<String>'p2p.payment.received'</String>, handleIncomingPayment);</>,
        ],
        [TransactionStatus.PROCESSING]: [
            <><Comment>// Received a webhook for an incoming payment.</Comment></>,
            <><Keyword>const</Keyword> childSpan = tracer.<Func>startSpan</Func>(<String>'receive.payment'</String>, {'{'}</>,
            <>  parentTraceId: <String>'{traceId ? `${traceId.slice(0, 18)}...` : ''}'</String></>,
            <>{'});'}</>,
            <>childSpan.<Func>setAttribute</Func>(<String>'recipient.email'</String>, <String>'{recipientEmail}'</String>);</>,
            <>childSpan.<Func>setAttribute</Func>(<String>'payment.amount'</String>, <NumberVal>{amount.toFixed(2)}</NumberVal>);</>,
            <>&nbsp;</>,
            <><Comment>// Waiting for confirmation from the payment network.</Comment></>,
            <><Keyword>const</Keyword> result = <Keyword>await</Keyword> <Func>waitForNetworkConfirmation</Func>(traceId);</>,
        ],
        [TransactionStatus.PENDING_CONFIRMATION]: [
            <><Comment>// Network confirmation is taking longer than expected.</Comment></>,
            <><Comment>// The sender's client has entered a PENDING state.</Comment></>,
            <><Comment>// Our system continues to wait for a final status...</Comment></>,
            <><Keyword>const</Keyword> result = <Keyword>await</Keyword> <Func>waitForNetworkConfirmation</Func>(traceId);</>,
            <><span className="text-yellow-400">{'// -> Still awaiting promise resolution...'}</span></>,
        ],
        [TransactionStatus.SUCCESS]: [
            <><Comment>// Network confirmation received: SUCCESS.</Comment></>,
            <>childSpan.<Func>addEvent</Func>(<String>'network.confirmed.success'</String>);</>,
            <><Keyword>const</Keyword> recipientAccount = <Keyword>await</Keyword> <Func>db.findAccount</Func>({'{'}email: <String>'{recipientEmail}'</String>{'}'});</>,
            <>recipientAccount.balance += <NumberVal>{amount.toFixed(2)}</NumberVal>;</>,
            <><Keyword>await</Keyword> recipientAccount.<Func>save</Func>();</>,
            <>childSpan.<Func>setStatus</Func>({'{'} code: <String>'OK'</String> {'}'});</>,
            <>childSpan.<Func>end</Func>();</>,
            <><Func>notifyRecipient</Func>(<String>'Payment received!'</String>);</>,
        ],
        [TransactionStatus.FAILED]: [
            <><Comment>// Network confirmation received: FAILED.</Comment></>,
            <>childSpan.<Func>addEvent</Func>(<String>'network.confirmed.failed'</String>);</>,
            <>childSpan.<Func>setStatus</Func>({'{'} code: <String>'ERROR'</String>, message: <String>'SenderCancelled'</String> {'}'});</>,
            <>childSpan.<Func>end</Func>();</>,
            <>&nbsp;</>,
            <><Comment>// No funds are moved.</Comment></>,
            <><Func>notifyRecipient</Func>(<String>'Incoming payment failed.'</String>);</>,
        ],
        [TransactionStatus.SUCCESS_AFTER_PENDING]: [
            <><Comment>// Delayed network confirmation received: SUCCESS.</Comment></>,
            <>childSpan.<Func>addEvent</Func>(<String>'network.confirmed.success.late'</String>);</>,
            <><Keyword>const</Keyword> recipientAccount = <Keyword>await</Keyword> <Func>db.findAccount</Func>({'{'}email: <String>'{recipientEmail}'</String>{'}'});</>,
            <>recipientAccount.balance += <NumberVal>{amount.toFixed(2)}</NumberVal>;</>,
            <><Keyword>await</Keyword> recipientAccount.<Func>save</Func>();</>,
            <>childSpan.<Func>setStatus</Func>({'{'} code: <String>'OK'</String> {'}'});</>,
            <>childSpan.<Func>end</Func>();</>,
            <><Func>notifyRecipient</Func>(<String>'Payment received!'</String>);</>,
        ],
        [TransactionStatus.FAILED_AFTER_PENDING]: [
            <><Comment>// Delayed network confirmation received: FAILED.</Comment></>,
            <>childSpan.<Func>addEvent</Func>(<String>'network.confirmed.failed.late'</String>);</>,
            <>childSpan.<Func>setStatus</Func>({'{'} code: <String>'ERROR'</String>, message: <String>'SenderCancelled'</String> {'}'});</>,
            <>childSpan.<Func>end</Func>();</>,
            <>&nbsp;</>,
            <><Comment>// No funds are moved.</Comment></>,
            <><Func>notifyRecipient</Func>(<String>'Incoming payment failed.'</String>);</>,
        ]
    }), [traceId, amount, recipientEmail]);

    useEffect(() => {
        const snippet = codeSnippets[status] || [];
        const animationSpeed = ANIMATION_SPEEDS[status as keyof typeof ANIMATION_SPEEDS] || 500;
        let timeoutId: ReturnType<typeof setTimeout>;

        const animateLine = (line: number) => {
            if (line >= snippet.length) {
                setCurrentLine(snippet.length - 1);
                return;
            }
            setCurrentLine(line);
            timeoutId = setTimeout(() => animateLine(line + 1), animationSpeed);
        };

        animateLine(0);
        return () => clearTimeout(timeoutId);
      }, [status, codeSnippets]);

    const currentSnippet = codeSnippets[status as keyof typeof codeSnippets] || codeSnippets[TransactionStatus.IDLE];
    
    const renderStatusBox = () => {
        switch (status) {
            case TransactionStatus.IDLE:
                return (
                    <div className="p-4 rounded-lg text-center mb-4 bg-gray-100 border border-gray-200 min-h-[124px] flex items-center justify-center">
                        <p className="text-lg font-medium text-gray-500">Waiting for transaction...</p>
                    </div>
                );
            case TransactionStatus.PROCESSING:
                return (
                    <div className="p-4 rounded-lg text-center mb-4 bg-blue-50 border border-blue-200 min-h-[124px] flex flex-col items-center justify-center">
                        <SpinnerIcon className="mx-auto mb-2 h-6 w-6 text-blue-500" />
                        <p className="text-lg font-medium text-blue-600">Receiving ${amount.toFixed(2)}...</p>
                    </div>
                );
            case TransactionStatus.PENDING_CONFIRMATION:
                return (
                    <div className="p-4 rounded-lg text-center mb-4 bg-yellow-50 border border-yellow-200 min-h-[124px] flex flex-col items-center justify-center">
                        <SpinnerIcon className="mx-auto mb-2 h-6 w-6 text-yellow-500" />
                        <h3 className="text-lg font-medium text-yellow-700">Payment Pending</h3>
                        <p className="text-sm text-yellow-600 mt-1">Confirmation is taking longer than usual.</p>
                    </div>
                );
            case TransactionStatus.SUCCESS:
            case TransactionStatus.SUCCESS_AFTER_PENDING:
                return (
                    <div className="p-4 rounded-lg text-center mb-4 bg-green-50 border border-green-200 min-h-[124px] flex flex-col items-center justify-center">
                         <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-2">
                            <CheckIcon />
                         </div>
                        <h3 className="text-lg font-medium text-green-700">Payment Received!</h3>
                        <p className="text-2xl font-bold text-green-800">${amount.toFixed(2)}</p>
                    </div>
                );
            case TransactionStatus.FAILED:
            case TransactionStatus.FAILED_AFTER_PENDING:
                return (
                     <div className="p-4 rounded-lg text-center mb-4 bg-red-50 border border-red-200 min-h-[124px] flex flex-col items-center justify-center">
                         <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-2">
                            <XIcon />
                         </div>
                        <h3 className="text-lg font-medium text-red-700">Transaction Failed</h3>
                        <p className="text-sm text-red-600 mt-1">The incoming payment could not be completed.</p>
                    </div>
                );
            default:
                return (
                    <div className="p-4 rounded-lg text-center mb-4 bg-gray-100 border border-gray-200 min-h-[124px] flex items-center justify-center">
                        <p className="text-lg font-medium text-gray-500">Waiting for transaction...</p>
                    </div>
                );
        }
    };


    return (
        <div>
            {renderStatusBox()}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto min-h-[268px]">
                <code>
                    {currentSnippet.map((line, index) => (
                        <CodeLine key={index} isHighlighted={index === currentLine}>{line}</CodeLine>
                    ))}
                </code>
            </div>
        </div>
    );
};