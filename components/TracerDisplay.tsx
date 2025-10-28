import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TransactionStatus, TestCase } from '../types';
import { WATCHDOG_TIMEOUT_MS } from '../constants';

// Helper components for syntax highlighting
const CodeLine: React.FC<{ children: React.ReactNode; isHighlighted?: boolean, isBlinking?: boolean }> = ({ children, isHighlighted, isBlinking }) => (
    <div className={`whitespace-pre-wrap transition-colors duration-200 px-2 rounded ${isHighlighted ? 'bg-slate-800' : ''} ${isBlinking ? 'animate-pulse' : ''}`}>
        {children}
    </div>
);

const Keyword: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-fuchsia-400">{children}</span>;
const Func: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-sky-400">{children}</span>;
const String: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-emerald-400">{children}</span>;
const Comment: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-gray-500">{children}</span>;
const NumberVal: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-orange-400">{children}</span>;

interface TracerDisplayProps {
    status: TransactionStatus;
    traceId: string;
    amount: number;
    activeCase: TestCase;
    onLog: (line: number) => void;
}

const LIKELY_TO_FAIL_THRESHOLD_S = 13;
const MAX_VISUAL_TIME_S = 14;

export const TracerDisplay: React.FC<TracerDisplayProps> = ({ status, traceId, amount, activeCase, onLog }) => {
    const [currentLine, setCurrentLine] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    
    const startTimeRef = useRef<number | null>(null);
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const animationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const codeContainerRef = useRef<HTMLElement | null>(null);
    const watchdogThreshold = useMemo(() => WATCHDOG_TIMEOUT_MS / 1000, []);

    // Effect to manage the master timer for elapsedTime
    useEffect(() => {
        const isProcessingOrPending = status === TransactionStatus.PROCESSING || status === TransactionStatus.PENDING_CONFIRMATION;

        if (isProcessingOrPending) {
            if (startTimeRef.current === null) startTimeRef.current = Date.now();
            if (timerIntervalRef.current === null) {
                timerIntervalRef.current = setInterval(() => {
                    if (startTimeRef.current) setElapsedTime((Date.now() - startTimeRef.current) / 1000);
                }, 50);
            }
        } else {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            if (status === TransactionStatus.IDLE) {
                setElapsedTime(0);
                startTimeRef.current = null;
            }
        }
        
        return () => { 
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        };
    }, [status]);
    
    const codeSnippet = useMemo(() => [
        /* 0*/ <><Comment>// Waiting for transaction...</Comment></>,
        /* 1*/ <><Keyword>const</Keyword> traceId = <String>'{traceId ? `${traceId.slice(0, 18)}...` : '...'}'</String>;</>,
        /* 2*/ <><Keyword>const</Keyword> parentSpan = tracer.<Func>startSpan</Func>(<String>'process.payment'</String>, {'{'} traceId {'}'});</>,
        /* 3*/ <><Comment>// Set attributes for this specific transaction.</Comment></>,
        /* 4*/ <>parentSpan.<Func>setAttribute</Func>(<String>'payment.amount'</String>, <NumberVal>{amount > 0 ? amount.toFixed(2) : '...'}</NumberVal>);</>,
        /* 5*/ <>&nbsp;</>,
        /* 6*/ <><Comment>// Start a watchdog timer. If the backend is slow, this will fire.</Comment></>,
        /* 7*/ <><Keyword>const</Keyword> watchdog = <Func>setTimeout</Func>(() => {'{'}</>,
        /* 8*/ <>  <Comment>  // Watchdog triggered! The backend is taking too long.</Comment></>,
        /* 9*/ <>  parentSpan.<Func>addEvent</Func>(<String>'watchdog.triggered'</String>);</>,
        /*10*/ <>  <Func>ui.updateStatus</Func>(<String>'PENDING_CONFIRMATION'</String>);</>,
        /*11*/ <>{'},'} <NumberVal>{WATCHDOG_TIMEOUT_MS}</NumberVal>);</>,
        /*12*/ <>&nbsp;</>,
        /*13*/ <><Comment>// Send the request. We are now waiting for the backend to respond.</Comment></>,
        /*14*/ <><Keyword>const</Keyword> result = <Keyword>await</Keyword> <Func>callBackend</Func>(<String>'/api/pay'</String>, ...);</>,
        /*15*/ <>&nbsp;</>,
        /*16*/ <><Comment>// Backend has responded. Stop the watchdog timer.</Comment></>,
        /*17*/ <><Func>clearTimeout</Func>(watchdog);</>,
        /*18*/ <>&nbsp;</>,
        /*19*/ <><Comment>// Process the final result.</Comment></>,
        /*20*/ <><Keyword>if</Keyword> (result.status === <String>'SUCCESS'</String>) {'{'}</>,
        /*21*/ <>  parentSpan.<Func>setStatus</Func>({'{'} code: <String>'OK'</String> {'}'});</>,
        /*22*/ <>  <Func>ui.updateStatus</Func>(<String>'SUCCESS'</String>);</>,
        /*23*/ <>{'} '} <Keyword>else</Keyword> {'{'}</>,
        /*24*/ <>  parentSpan.<Func>setStatus</Func>({'{'} code: <String>'ERROR'</String> {'}'});</>,
        /*25*/ <>  <Func>ui.updateStatus</Func>(<String>'FAILED'</String>);</>,
        /*26*/ <>{'}'}</>,
        /*27*/ <>&nbsp;</>,
        /*28*/ <><Comment>// End the trace. All work is complete.</Comment></>,
        /*29*/ <>parentSpan.<Func>end</Func>();</>,
    ], [traceId, amount]);

    // Effect to manage code highlighting animation
    useEffect(() => {
        if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);

        const playSequence = (lines: number[], speed: number) => {
            let index = 0;
            const run = () => {
                if (index < lines.length) {
                    const line = lines[index];
                    setCurrentLine(line);
                    onLog(line); // Fire log event
                    index++;
                } else {
                    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
                }
            };
            run(); // Run first line immediately
            animationIntervalRef.current = setInterval(run, speed);
        };

        const finalSuccessPath = [17, 20, 21, 22, 29];
        const finalFailurePath = [17, 20, 24, 25, 29];

        switch (status) {
            case TransactionStatus.IDLE:
                setCurrentLine(0);
                break;
            
            case TransactionStatus.PROCESSING:
                const processingLines = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13, 14];
                playSequence(processingLines, 250);
                break;
            
            case TransactionStatus.PENDING_CONFIRMATION:
                 playSequence([8, 9, 10], 150);
                break;

            case TransactionStatus.SUCCESS:
            case TransactionStatus.SUCCESS_AFTER_PENDING:
                playSequence(finalSuccessPath, 35);
                break;
            
            case TransactionStatus.FAILED:
            case TransactionStatus.FAILED_AFTER_PENDING:
                playSequence(finalFailurePath, 35);
                break;
        }

        return () => { if (animationIntervalRef.current) clearInterval(animationIntervalRef.current); };
    }, [status, onLog]);

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

    const progressPercentage = status === TransactionStatus.IDLE ? 0 : Math.min((elapsedTime / MAX_VISUAL_TIME_S) * 100, 100);
    const getProgressBarColor = () => {
        if (elapsedTime > LIKELY_TO_FAIL_THRESHOLD_S) return 'bg-red-600';
        if (elapsedTime > watchdogThreshold) return 'bg-yellow-500';
        return 'bg-sky-500';
    };
    const isPending = status === TransactionStatus.PENDING_CONFIRMATION || status === TransactionStatus.SUCCESS_AFTER_PENDING || status === TransactionStatus.FAILED_AFTER_PENDING;

    return (
        <div className="mt-12 md:mt-0">
            <h2 className="text-xl font-medium text-black mb-4">Tracer View</h2>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-gray-400">WATCHDOG TIMER</span>
                        <span className={`text-sm font-bold transition-colors ${elapsedTime > LIKELY_TO_FAIL_THRESHOLD_S ? 'text-red-500' : isPending ? 'text-yellow-400' : 'text-gray-300'}`}>
                           {elapsedTime.toFixed(2)}s / {MAX_VISUAL_TIME_S.toFixed(1)}s
                        </span>
                    </div>
                    <div className="relative w-full bg-slate-700 rounded-full h-2.5">
                        <div 
                            className={`h-2.5 rounded-full transition-all duration-100 ease-linear ${getProgressBarColor()}`} 
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                        <div 
                            className="absolute -top-1 -bottom-1 w-px bg-yellow-400"
                            style={{ left: `${(watchdogThreshold / MAX_VISUAL_TIME_S) * 100}%` }}
                            title={`Pending Threshold: ${watchdogThreshold}s`}
                        >
                             <div className="absolute -bottom-5 -translate-x-1/2 text-yellow-400 text-xs font-bold">{watchdogThreshold}s</div>
                        </div>
                        <div 
                            className="absolute -top-1 -bottom-1 w-px bg-red-500"
                            style={{ left: `${(LIKELY_TO_FAIL_THRESHOLD_S / MAX_VISUAL_TIME_S) * 100}%` }}
                            title={`High-Risk Threshold: ${LIKELY_TO_FAIL_THRESHOLD_S}s`}
                        >
                             <div className="absolute -bottom-5 -translate-x-1/2 text-red-500 text-xs font-bold">{LIKELY_TO_FAIL_THRESHOLD_S}s</div>
                        </div>
                    </div>
                </div>
                <code ref={codeContainerRef} className="block h-96 overflow-y-auto">
                    {codeSnippet.map((line, index) => (
                        <CodeLine key={index} isHighlighted={index === currentLine}>
                          {line}
                        </CodeLine>
                    ))}
                </code>
            </div>
        </div>
    );
};