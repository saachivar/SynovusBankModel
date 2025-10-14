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
    [TransactionStatus.PROCESSING]: 400, // Total: 6s, before 7s watchdog.
    [TransactionStatus.PENDING_CONFIRMATION]: 400, // Faster feedback
    [TransactionStatus.SUCCESS]: 100, // Very snappy finish
    [TransactionStatus.FAILED]: 100, // Very snappy finish
    [TransactionStatus.SUCCESS_AFTER_PENDING]: 300, // Slower, more deliberate finish
    [TransactionStatus.FAILED_AFTER_PENDING]: 300, // Slower, more deliberate finish
};

// Helper components for syntax highlighting
const CodeLine: React.FC<{ children: React.ReactNode; isHighlighted?: boolean }> = ({ children, isHighlighted }) => (
    <div className={`whitespace-pre-wrap transition-colors duration-300 px-2 rounded ${isHighlighted ? 'bg-slate-800' : ''}`}>
        {children}
    </div>
);

const Keyword: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-fuchsia-400">{children}</span>
);

const Func: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-sky-400">{children}</span>
);

const String: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-emerald-400">{children}</span>
);

const Comment: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-gray-500">{children}</span>
);

const NumberVal: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="text-orange-400">{children}</span>
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
            <><Comment>// Backend responded successfully (before watchdog).</Comment></>,
            <><Func>clearTimeout</Func>(watchdog); <Comment>// Watchdog cancelled in time.</Comment></>,
            <>parentSpan.<Func>addEvent</Func>(<String>'backend.response.success'</String>);</>,
            <>parentSpan.<Func>setStatus</Func>({'{'} code: <String>'OK'</String> {'}'});</>,
            <>parentSpan.<Func>end</Func>(); <Comment>// Span is complete.</Comment></>,
            <>&nbsp;</>,
            <><Comment>// Final UI state.</Comment></>,
            <><Func>ui.updateStatus</Func>(<String>'SUCCESS'</String>);</>,
        ],
        [TransactionStatus.FAILED]: [
            <><Comment>// Backend responded with an error (before watchdog).</Comment></>,
            <><Func>clearTimeout</Func>(watchdog); <Comment>// Watchdog cancelled in time.</Comment></>,
            <>parentSpan.<Func>addEvent</Func>(<String>'backend.response.failed'</String>);</>,
            <>parentSpan.<Func>setStatus</Func>({'{'} code: <String>'ERROR'</String>, message: <String>'...'</String> {'}'});</>,
            <>parentSpan.<Func>end</Func>(); <Comment>// Span is complete.</Comment></>,
            <>&nbsp;</>,
            <><Comment>// Final UI state.</Comment></>,
            <><Func>ui.updateStatus</Func>(<String>'FAILED'</String>);</>,
        ],
        [TransactionStatus.SUCCESS_AFTER_PENDING]: [
            <><Comment>// Backend finally responded successfully.</Comment></>,
            <><Comment>// The watchdog had already triggered.</Comment></>,
            <><Func>clearTimeout</Func>(watchdog); <Comment>// Clear the fired timer.</Comment></>,
            <>parentSpan.<Func>addEvent</Func>(<String>'backend.response.success.late'</String>);</>,
            <>parentSpan.<Func>setStatus</Func>({'{'} code: <String>'OK'</String> {'}'});</>,
            <>parentSpan.<Func>end</Func>(); <Comment>// Span is complete.</Comment></>,
            <>&nbsp;</>,
            <><Comment>// Final UI state updated from PENDING.</Comment></>,
            <><Func>ui.updateStatus</Func>(<String>'SUCCESS'</String>);</>,
        ],
        [TransactionStatus.FAILED_AFTER_PENDING]: [
            <><Comment>// Backend finally responded with an error.</Comment></>,
            <><Comment>// The watchdog had already triggered.</Comment></>,
            <><Func>clearTimeout</Func>(watchdog); <Comment>// Clear the fired timer.</Comment></>,
            <>parentSpan.<Func>addEvent</Func>(<String>'backend.response.failed.late'</String>);</>,
            <>parentSpan.<Func>setStatus</Func>({'{'} code: <String>'ERROR'</String>, message: <String>'...'</String> {'}'});</>,
            <>parentSpan.<Func>end</Func>(); <Comment>// Span is complete.</Comment></>,
            <>&nbsp;</>,
            <><Comment>// Final UI state updated from PENDING.</Comment></>,
            <><Func>ui.updateStatus</Func>(<String>'FAILED'</String>);</>,
        ]
    }), [traceId, watchdogThreshold]);

    useEffect(() => {
        const snippet = codeSnippets[status] || [];
        const snippetLength = snippet.length;
        if (snippetLength === 0) {
            return; // No snippet to animate
        }
    
        const animationSpeed = ANIMATION_SPEEDS[status as keyof typeof ANIMATION_SPEEDS] || 500;
        let timeoutId: ReturnType<typeof setTimeout>;

        const animateLine = (line: number) => {
            if (line >= snippetLength) {
                // Animation is done, stay on the last line
                setCurrentLine(snippetLength - 1);
                return;
            }
            setCurrentLine(line);
            timeoutId = setTimeout(() => {
                animateLine(line + 1);
            }, animationSpeed);
        };

        // Start animation from the first line
        animateLine(0);
    
        return () => clearTimeout(timeoutId); // Cleanup on re-render or unmount
      }, [status, codeSnippets]);

    const currentSnippet = codeSnippets[status as keyof typeof codeSnippets] || codeSnippets[TransactionStatus.IDLE];

    return (
        <div className="mt-12 md:mt-0">
            <h2 className="text-xl font-medium text-black mb-4">Tracer View</h2>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto min-h-[350px]">
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