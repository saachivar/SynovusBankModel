import React, { useState, useEffect, useMemo } from 'react';
import { TransactionStatus } from '../types';
import { WATCHDOG_TIMEOUT_MS } from '../constants';

interface TracerDisplayProps {
  status: TransactionStatus;
  traceId: string;
}

// Define different animation speeds for each status to ensure logical timing.
const ANIMATION_SPEEDS: { [key in TransactionStatus]: number } = {
    [TransactionStatus.IDLE]: 750,
    [TransactionStatus.PROCESSING]: 400, // Faster: completes in 6s, before 7s watchdog.
    [TransactionStatus.PENDING_CONFIRMATION]: 750,
    [TransactionStatus.SUCCESS]: 750,
    [TransactionStatus.FAILED]: 750,
};

// Helper components for syntax highlighting
const CodeLine: React.FC<{ children: React.ReactNode; isHighlighted?: boolean }> = ({ children, isHighlighted }) => (
    <div className={`whitespace-pre-wrap transition-colors duration-300 px-2 rounded ${isHighlighted ? 'bg-sky-900/60' : ''}`}>
        {children}
    </div>
);

const Keyword: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-pink-400">{children}</span>
);

const Func: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-sky-400">{children}</span>
);

const String: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-lime-300">{children}</span>
);

const Comment: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-slate-500">{children}</span>
);

const NumberVal: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="text-amber-300">{children}</span>
);

export const TracerDisplay: React.FC<TracerDisplayProps> = ({ status, traceId }) => {
    const [currentLine, setCurrentLine] = useState(0);
    const watchdogThreshold = useMemo(() => WATCHDOG_TIMEOUT_MS / 1000, []);

    const codeSnippets = useMemo(() => ({
        [TransactionStatus.IDLE]: [
            <><Comment>// Waiting for a transaction to begin...</Comment></>,
            <><Keyword>const</Keyword> tracer = <Func>opentelemetry.getTracer</Func>(<String>'payment-service-ui'</String>);</>,
            <>tracer.<Func>on</Func>(<String>'payment_initiated'</String>, handlePayment);</>,
        ],
        [TransactionStatus.PROCESSING]: [
            <><Comment>// Transaction started. Creating a new trace.</Comment></>,
            <><Keyword>const</Keyword> parentSpan = tracer.<Func>startSpan</Func>(<String>'process.payment'</String>, {'{'}</>,
            <>  traceId: <String>'{traceId ? `${traceId.slice(0, 18)}...` : ''}'</String>,</>,
            <>{'});'}</>,
            <>parentSpan.<Func>setAttribute</Func>(<String>'payment.amount'</String>, <NumberVal>25.00</NumberVal>);</>,
            <>&nbsp;</>,
            <><Comment>// Start a watchdog to monitor backend response time.</Comment></>,
            <><Keyword>const</Keyword> watchdogThreshold = <NumberVal>{watchdogThreshold}</NumberVal>; <Comment>// seconds</Comment></>,
            <><Keyword>const</Keyword> watchdog = <Func>setTimeout</Func>(() => {'{'}</>,
            <>  parentSpan.<Func>addEvent</Func>(<String>'watchdog.triggered'</String>);</>,
            <>  <Func>ui.updateStatus</Func>(<String>'PENDING_CONFIRMATION'</String>);</>,
            <>{'},'} watchdogThreshold * <NumberVal>1000</NumberVal>);</>,
            <>&nbsp;</>,
            <><Comment>// Sending request to the backend service.</Comment></>,
            <><Func>callBackend</Func>(<String>'/api/pay'</String>, {'{'} traceId, amount {'}'});</>,
        ],
        [TransactionStatus.PENDING_CONFIRMATION]: [
            <><Comment>// Backend response is taking longer than expected.</Comment></>,
            <><Comment>// The watchdog timer has now fired.</Comment></>,
            <><Keyword>const</Keyword> watchdog = <Func>setTimeout</Func>(() => {'{'}</>,
            <>  <span className="text-yellow-400 font-bold">parentSpan.<Func>addEvent</Func>(<String>'watchdog.triggered'</String>);</span></>,
            <>  <span className="text-yellow-400 font-bold"><Func>ui.updateStatus</Func>(<String>'PENDING_CONFIRMATION'</String>);</span></>,
            <>{'},'} watchdogThreshold * <NumberVal>1000</NumberVal>); <Comment> // {'<-'} Threshold exceeded!</Comment></>,
            <>&nbsp;</>,
            <><Comment>// UI is now in PENDING state.</Comment></>,
            <><Comment>// Still waiting for final confirmation from backend...</Comment></>,
        ],
        [TransactionStatus.SUCCESS]: [
            <><Comment>// Backend responded successfully.</Comment></>,
            <><Func>clearTimeout</Func>(watchdog); <Comment>// Watchdog is cancelled.</Comment></>,
            <>parentSpan.<Func>addEvent</Func>(<String>'backend.response.success'</String>);</>,
            <>parentSpan.<Func>setStatus</Func>({'{'} code: <String>'OK'</String> {'}'});</>,
            <>parentSpan.<Func>end</Func>(); <Comment>// Span is complete.</Comment></>,
            <>&nbsp;</>,
            <><Comment>// Final UI state.</Comment></>,
            <><Func>ui.updateStatus</Func>(<String>'SUCCESS'</String>);</>,
        ],
        [TransactionStatus.FAILED]: [
            <><Comment>// Backend responded with an error.</Comment></>,
            <><Func>clearTimeout</Func>(watchdog); <Comment>// Watchdog is cancelled.</Comment></>,
            <>parentSpan.<Func>addEvent</Func>(<String>'backend.response.failed'</String>);</>,
            <>parentSpan.<Func>setStatus</Func>({'{'} code: <String>'ERROR'</String>, message: <String>'...'</String> {'}'});</>,
            <>parentSpan.<Func>end</Func>(); <Comment>// Span is complete.</Comment></>,
            <>&nbsp;</>,
            <><Comment>// Final UI state.</Comment></>,
            <><Func>ui.updateStatus</Func>(<String>'FAILED'</String>);</>,
        ]
    }), [traceId, watchdogThreshold]);

    useEffect(() => {
        setCurrentLine(0); // Reset animation on any status change.
    
        // Use a different animation speed depending on the transaction status.
        const animationSpeed = ANIMATION_SPEEDS[status];
    
        const interval = setInterval(() => {
          setCurrentLine(prevLine => {
            const snippetLength = (codeSnippets[status] || []).length;
            if (prevLine >= snippetLength - 1) {
              clearInterval(interval);
              return prevLine; // Stop on the last line
            }
            return prevLine + 1;
          });
        }, animationSpeed); // Use the status-specific speed
    
        return () => clearInterval(interval); // Cleanup on re-render or unmount
      }, [status, codeSnippets]);

    const currentSnippet = codeSnippets[status] || codeSnippets[TransactionStatus.IDLE];

    return (
        <div className="mt-12 md:mt-0">
            <h2 className="text-xl font-medium text-black mb-4">Tracer View</h2>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-gray-200 overflow-x-auto min-h-[350px]">
                <code>
                    {currentSnippet.map((line, index) => (
                        <CodeLine key={index} isHighlighted={index === currentLine}>
                          {line}
                        </CodeLine>
                    ))}
                </code>
            </div>
        </div>
    );
};