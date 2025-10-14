// FIX: Implement the main App component to resolve module and rendering errors.
import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PaymentForm } from './components/PaymentForm';
import { StatusDisplay } from './components/StatusDisplay';
import { TracerDisplay } from './components/TracerDisplay';
import { TransactionStatus } from './types';
import { processPayment } from './services/paymentService';
import { WATCHDOG_TIMEOUT_MS } from './constants';

const App: React.FC = () => {
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.IDLE);
  const [traceId, setTraceId] = useState<string>('');
  // FIX: In a browser environment, setTimeout returns a number, not a NodeJS.Timeout object.
  const watchdogTimer = useRef<number | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (watchdogTimer.current) {
        clearTimeout(watchdogTimer.current);
      }
    };
  }, []);

  const handlePayment = async (amount: number) => {
    const newTraceId = crypto.randomUUID();
    setTraceId(newTraceId);
    setStatus(TransactionStatus.PROCESSING);
    console.log(`[App] Starting payment. Trace ID: ${newTraceId}, Amount: $${amount}`);

    if (watchdogTimer.current) {
      clearTimeout(watchdogTimer.current);
    }

    watchdogTimer.current = window.setTimeout(() => {
      console.log(`[App] Watchdog triggered. Trace ID: ${newTraceId}`);
      setStatus(TransactionStatus.PENDING_CONFIRMATION);
    }, WATCHDOG_TIMEOUT_MS);

    try {
      const result = await processPayment(newTraceId, amount);
      if (watchdogTimer.current) {
        clearTimeout(watchdogTimer.current);
        watchdogTimer.current = null;
      }
      console.log(`[App] Payment responded. Trace ID: ${result.traceId}, Status: ${result.status}`);
      setStatus(result.status === 'SUCCESS' ? TransactionStatus.SUCCESS : TransactionStatus.FAILED);
    } catch (error) {
      if (watchdogTimer.current) {
        clearTimeout(watchdogTimer.current);
        watchdogTimer.current = null;
      }
      console.error(`[App] Payment failed with an exception. Trace ID: ${newTraceId}`, error);
      setStatus(TransactionStatus.FAILED);
    }
  };

  const handleReset = () => {
    if (watchdogTimer.current) {
      clearTimeout(watchdogTimer.current);
      watchdogTimer.current = null;
    }
    setStatus(TransactionStatus.IDLE);
    setTraceId('');
    console.log('[App] Resetting payment flow.');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <div className="md:grid md:grid-cols-2 md:gap-12">
              {/* Left Column: Payment UI */}
              <div>
                <h1 className="block text-xl leading-tight font-medium text-black">Make a Payment</h1>
                <p className="mt-2 text-gray-500">
                  Enter an amount and click pay. The mock backend will simulate different response times and outcomes.
                </p>
                <div className="mt-6">
                  {status === TransactionStatus.IDLE ? (
                    <PaymentForm onPay={handlePayment} />
                  ) : (
                    <StatusDisplay status={status} traceId={traceId} onReset={handleReset} />
                  )}
                </div>
              </div>
              
              {/* Right Column: Tracer View */}
              <TracerDisplay status={status} traceId={traceId} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;