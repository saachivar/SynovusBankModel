import React, { useState, useEffect, useMemo } from 'react';
import { TransactionStatus } from '../types';

interface RecipientTracerProps {
  status: TransactionStatus;
  traceId: string;
  amount: number;
  recipientEmail: string;
}

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
    
    let statusMessage, statusColor;
    switch (status) {
        case TransactionStatus.IDLE: statusMessage = 'Waiting for transaction...'; statusColor = 'text-gray-500'; break;
        case TransactionStatus.PROCESSING:
        case TransactionStatus.PENDING_CONFIRMATION:
            statusMessage = `Receiving $${amount.toFixed(2)}...`; statusColor = 'text-blue-600 animate-pulse'; break;
        case TransactionStatus.SUCCESS:
        case TransactionStatus.SUCCESS_AFTER_PENDING:
            statusMessage = `Successfully received $${amount.toFixed(2)}!`; statusColor = 'text-green-600'; break;
        case TransactionStatus.FAILED:
        case TransactionStatus.FAILED_AFTER_PENDING:
            statusMessage = 'Incoming transaction failed.'; statusColor = 'text-red-600'; break;
        default: statusMessage = ''; statusColor = '';
    }

    return (
        <div>
            <div className={`p-4 rounded-lg text-center mb-4 ${status === TransactionStatus.IDLE ? 'bg-gray-100' : 'bg-blue-50'}`}>
                <p className={`text-lg font-medium ${statusColor}`}>{statusMessage}</p>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto min-h-[350px]">
                <code>
                    {currentSnippet.map((line, index) => (
                        <CodeLine key={index} isHighlighted={index === currentLine}>{line}</CodeLine>
                    ))}
                </code>
            </div>
        </div>
    );
};
