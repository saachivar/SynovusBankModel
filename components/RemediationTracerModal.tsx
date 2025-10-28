import React, { useState, useEffect, useMemo } from 'react';
import { Transaction } from '../types';

interface RemediationTracerModalProps {
  transaction: Transaction | null;
}

const CodeLine: React.FC<{ children: React.ReactNode; isHighlighted?: boolean }> = ({ children, isHighlighted }) => (
    <div className={`whitespace-pre-wrap transition-colors duration-200 px-2 rounded ${isHighlighted ? 'bg-slate-800' : ''}`}>{children}</div>
);
const Keyword: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-fuchsia-400">{children}</span>;
const Func: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-sky-400">{children}</span>;
const String: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-emerald-400">{children}</span>;
const Comment: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="text-gray-500">{children}</span>;

const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`animate-spin h-5 w-5 text-white ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

export const RemediationTracerModal: React.FC<RemediationTracerModalProps> = ({ transaction }) => {
  const [currentLine, setCurrentLine] = useState(0);

  const codeSnippet = useMemo(() => [
    /* 0*/ <><Comment>// Re-checking status for a previously failed transaction.</Comment></>,
    /* 1*/ <><Keyword>const</Keyword> traceId = <String>'{transaction ? `${transaction.id.slice(0, 18)}...` : '...'}'</String>;</>,
    /* 2*/ <><Keyword>const</Keyword> reconciliationSpan = tracer.<Func>startSpan</Func>(<String>'remediate.tx.status'</String>);</>,
    /* 3*/ <>&nbsp;</>,
    /* 4*/ <><Comment>// Query the backend for the authoritative status.</Comment></>,
    /* 5*/ <><Keyword>const</Keyword> finalStatus = <Keyword>await</Keyword> backend.<Func>getStatus</Func>({'{'} traceId {'}'});</>,
    /* 6*/ <>&nbsp;</>,
    /* 7*/ <><Keyword>if</Keyword> (finalStatus.isSuccess) {'{'}</>,
    /* 8*/ <>  <Comment>  // The transaction actually succeeded.</Comment></>,
    /* 9*/ <>  <Func>reconcileTransactionAsSuccess</Func>(traceId);</>,
    /* 10*/ <>{'} '} <Keyword>else</Keyword> {'{'}</>,
    /* 11*/ <>  <Comment>  // The transaction is confirmed as failed.</Comment></>,
    /* 12*/ <>  <Func>confirmTransactionAsFailed</Func>(traceId);</>,
    /* 13*/ <>{'}'}</>,
    /* 14*/ <>reconciliationSpan.<Func>end</Func>();</>,
  ], [transaction]);

  useEffect(() => {
    if (transaction) {
      const animationSequence = [0, 1, 2, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14];
      let index = 0;
      const interval = setInterval(() => {
        if (index < animationSequence.length) {
          setCurrentLine(animationSequence[index]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 200); // 200ms per step

      return () => clearInterval(interval);
    } else {
        // Reset when modal is hidden
        setCurrentLine(0);
    }
  }, [transaction]);

  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 font-mono text-sm text-gray-300 w-full max-w-2xl mx-4">
        <div className="flex items-center mb-4">
            <SpinnerIcon />
            <h2 className="text-lg font-semibold text-white ml-3">Re-checking Transaction Status...</h2>
        </div>
        <code>
          {codeSnippet.map((line, index) => (
            <CodeLine key={index} isHighlighted={index === currentLine}>{line}</CodeLine>
          ))}
        </code>
      </div>
    </div>
  );
};
