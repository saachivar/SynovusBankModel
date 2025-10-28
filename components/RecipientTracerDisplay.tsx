import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TransactionStatus, TestCase } from '../types';

interface RecipientTracerProps {
  status: TransactionStatus;
  traceId: string;
  amount: number;
  recipientEmail: string;
  activeCase: TestCase;
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

const CodeLine: React.FC<{ children: React.ReactNode; isHighlighted?: boolean, isBlinking?: boolean }> = ({ children, isHighlighted, isBlinking }) => (
    <div className={`whitespace-pre-wrap transition-colors duration-200 px-2 rounded ${isHighlighted ? 'bg-slate-800' : ''} ${isBlinking ? 'animate-pulse' : ''}`}>{children}</div>
);
const Keyword: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-fuchsia-400">{children}</span>;
const Func: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-sky-400">{children}</span>;
const String: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-emerald-400">{children}</span>;
const Comment: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-gray-500">{children}</span>;
const NumberVal: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-orange-400">{children}</span>;

export const RecipientTracerDisplay: React.FC<RecipientTracerProps> = ({ status, traceId, amount, recipientEmail, activeCase }) => {
    const [currentLine, setCurrentLine] = useState(0);
    const animationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const codeContainerRef = useRef<HTMLElement | null>(null);

    const codeSnippet = useMemo(() => [
        /* 0*/ <><Comment>// Listening for incoming payment notifications via webhook...</Comment></>,
        /* 1*/ <><Keyword>const</Keyword> childSpan = tracer.<Func>startSpan</Func>(<String>'receive.payment'</String>, {'{'} parentTraceId {'}'});</>,
        /* 2*/ <>childSpan.<Func>setAttribute</Func>(<String>'recipient.email'</String>, <String>'{recipientEmail || '...'}'</String>);</>,
        /* 3*/ <>&nbsp;</>,
        /* 4*/ <><Comment>// Waiting for the payment network to confirm the transaction status.</Comment></>,
        /* 5*/ <><Keyword>const</Keyword> result = <Keyword>await</Keyword> <Func>waitForNetworkConfirmation</Func>(traceId);</>,
        /* 6*/ <>&nbsp;</>,
        /* 7*/ <><Comment>// Network has responded with a final status.</Comment></>,
        /* 8*/ <><Keyword>if</Keyword> (result.status === <String>'CONFIRMED'</String>) {'{'}</>,
        /* 9*/ <>  childSpan.<Func>addEvent</Func>(<String>'network.confirmed.success'</String>);</>,
        /*10*/ <>  <Keyword>const</Keyword> account = <Keyword>await</Keyword> <Func>db.findAccount</Func>(recipientEmail);</>,
        /*11*/ <>  account.balance += <NumberVal>{amount > 0 ? amount.toFixed(2) : '...'}</NumberVal>;</>,
        /*12*/ <>  <Keyword>await</Keyword> account.<Func>save</Func>();</>,
        /*13*/ <>  <Func>notifyRecipient</Func>(<String>'Payment received!'</String>);</>,
        /*14*/ <>{'} '} <Keyword>else</Keyword> {'{'}</>,
        /*15*/ <>  childSpan.<Func>addEvent</Func>(<String>'network.confirmed.failed'</String>);</>,
        /*16*/ <>  <Func>notifyRecipient</Func>(<String>'Incoming payment failed.'</String>);</>,
        /*17*/ <>{'}'}</>,
        /*18*/ <>&nbsp;</>,
        /*19*/ <>childSpan.<Func>setStatus</Func>({'{'} code: <String>'OK'</String> {'}'});</>,
        /*20*/ <>childSpan.<Func>end</Func>();</>,
    ], [traceId, amount, recipientEmail]);
    
    useEffect(() => {
        if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);

        const playSequence = (lines: number[], speed: number) => {
            let index = 0;
            const run = () => {
                if (index < lines.length) {
                    const line = lines[index];
                    setCurrentLine(line);
                    index++;
                } else {
                    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
                }
            };
            run();
            animationIntervalRef.current = setInterval(run, speed);
        };

        const fastSuccessSequence = [1, 2, 5, 8, 9, 10, 11, 12, 13, 19, 20];
        const finalSuccessSequence = [8, 9, 10, 11, 12, 13, 19, 20];
        const fastFailSequence = [1, 2, 5, 8, 15, 16, 19, 20];
        const finalFailSequence = [8, 15, 16, 19, 20];

        switch (status) {
            case TransactionStatus.IDLE:
                setCurrentLine(0);
                break;
            case TransactionStatus.PROCESSING:
                playSequence([1, 2, 4, 5], 150);
                break;
            case TransactionStatus.PENDING_CONFIRMATION:
                setCurrentLine(5);
                break;
            case TransactionStatus.SUCCESS:
                playSequence(fastSuccessSequence, 35);
                break;
            case TransactionStatus.SUCCESS_AFTER_PENDING:
                playSequence(finalSuccessSequence, 35);
                break;
            case TransactionStatus.FAILED:
                playSequence(fastFailSequence, 35);
                break;
            case TransactionStatus.FAILED_AFTER_PENDING:
                playSequence(finalFailSequence, 35);
                break;
        }

        return () => { if (animationIntervalRef.current) clearInterval(animationIntervalRef.current); };
    }, [status, activeCase]);
    
    // Effect to auto-scroll the code view
    useEffect(() => {
        if (codeContainerRef.current) {
            const lineElement = codeContainerRef.current.children[currentLine] as HTMLElement;
            if (lineElement) {
                lineElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }
    }, [currentLine]);

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
            default: return null;
        }
    };

    return (
        <div>
            {renderStatusBox()}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto h-80 flex flex-col">
                <h3 className="text-base text-white font-semibold mb-2">Recipient's Trace</h3>
                <code ref={codeContainerRef} className="overflow-y-auto">
                    {codeSnippet.map((line, index) => (
                        <CodeLine 
                            key={index} 
                            isHighlighted={index === currentLine}
                            isBlinking={status === TransactionStatus.PENDING_CONFIRMATION && index === currentLine}
                        >
                            {line}
                        </CodeLine>
                    ))}
                </code>
            </div>
        </div>
    );
};