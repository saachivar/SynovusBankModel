import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface EventLogProps {
    logs: LogEntry[];
}

export const EventLog: React.FC<EventLogProps> = ({ logs }) => {
    const logContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const getSourceChip = (source: 'FE' | 'BE') => {
        const baseClasses = 'px-2 py-0.5 text-xs font-semibold rounded-full';
        if (source === 'FE') {
            return <span className={`${baseClasses} bg-sky-100 text-sky-800`}>FE</span>;
        }
        return <span className={`${baseClasses} bg-emerald-100 text-emerald-800`}>BE</span>;
    };
    
    return (
        <div>
            <h2 className="text-xl font-medium text-black mb-4">Live Event Log</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-4 font-mono text-xs text-gray-700 h-64 overflow-y-auto" ref={logContainerRef}>
                {logs.length === 0 ? (
                     <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">Waiting for transaction to start...</p>
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className="flex items-start mb-2 last:mb-0">
                            <span className="text-gray-400 mr-2">{log.timestamp}</span>
                            <div className="mr-2">{getSourceChip(log.source)}</div>
                            <p className="flex-1 break-words">{log.message}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
