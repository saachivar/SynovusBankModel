# Tracer-Driven Watchdog Payment Demo

This is a frontend application that demonstrates a **tracer-driven watchdog pattern** for handling slow backend payment processing. It simulates a modern online banking interface to provide a realistic context for a common and critical challenge in distributed systems: ensuring a reliable and transparent user experience despite unpredictable network and service latency.

The core of the demo is to show how a client-side watchdog, instrumented with modern observability practices (tracing), can prevent duplicate transactions, reduce user anxiety, and provide a clear path to reconciliation when things go wrong.

---

## Key Concepts Demonstrated

### 1. The Watchdog Pattern
When a user initiates a payment, two things happen simultaneously:
1.  A request is sent to the backend.
2.  A client-side timer (the "watchdog") is started with a predefined timeout (e.g., 9 seconds).

- **Happy Path:** If the backend responds *before* the timeout, the timer is canceled, and the user sees a success or failure message immediately.
- **Slow Path:** If the backend is slow and the timer fires, the UI is moved to a **"Pending Confirmation"** state. This is a crucial UX improvement:
    - It assures the user their request has been received and is being processed.
    - It prevents the user from retrying the payment and creating a duplicate transaction.
    - The application can now wait indefinitely for the final backend response, which will eventually update the transaction's status in the user's activity feed.

### 2. Tracer-Driven Instrumentation
Every user action is tracked as part of a distributed trace. The "Tracer View" in the demo visualizes this process with pseudo-code:
- A `traceId` is created for each transaction, linking frontend and backend actions.
- A `parentSpan` is created to represent the entire payment operation.
- **Critical Events**, like the watchdog firing, are added to the span (`parentSpan.addEvent('watchdog.triggered')`). This provides invaluable data for developers to diagnose why transactions are slow and how often the watchdog is needed.
- The final status of the transaction (`OK` or `ERROR`) is recorded on the span.

### 3. Transaction Remediation
When a transaction is slow and ultimately fails (the "Slow Failure" test case), it enters a special state. The user knows the payment failed, but because it was pending, there's a small chance the backend state is ambiguous. The application provides a **"Re-check Status"** button, which simulates a reconciliation process. This kicks off a new trace to get the authoritative status from the backend, ensuring the user's account information is eventually consistent.

---

## Features

- **Simulated Banking UI:** A responsive interface featuring Accounts, Bill Pay, Transfers, and a Zelle-like P2P payment system.
- **Live Tracer & Event Log:** See the client-side logic and simulated backend events execute in real-time as you perform transactions.
- **Selectable Test Cases:** Choose from different backend behaviors to see how the application responds:
    - **Random:** A mix of fast and slow responses with a chance of failure.
    - **Fast Success:** The backend always responds quickly. The watchdog is never triggered.
    - **Slow Success:** The backend is intentionally slow. The watchdog **always** triggers, moving the UI to "Pending" before resolving to "Success".
    - **Slow Failure:** The backend is very slow and returns an error. The watchdog triggers, and the transaction becomes eligible for remediation.
- **Dual Tracer View (P2P):** The "Send Money" tab shows both the sender's and the recipient's trace spans, illustrating how a single transaction flows across multiple services.
- **Comprehensive Modals:** Includes modals for alerts, adding new accounts, enrolling in services, and scam warnings to create a more complete application feel.

---

## How to Use the Demo

1.  **Select a Tab:** Navigate to the **Payments**, **Transfers**, or **Send Money** (via the "Accounts" tab) views.
2.  **Choose a Test Case:** At the top of the view, select one of the backend simulation cases. "Slow Success" and "Slow Failure" are best for observing the watchdog pattern.
3.  **Initiate a Transaction:** Fill out the form and click the pay/transfer/send button.
4.  **Observe the Displays:**
    - **Payment Terminal:** Watch the status change from "Processing" to "Pending Confirmation" (if the watchdog triggers) and finally to its success or failed state.
    - **Tracer View:** Follow the highlighted lines of pseudo-code to understand what the application is doing under the hood. Note the timer and progress bar at the top.
    - **Event Log:** Read a plain-language log of events from both the Frontend (FE) and the simulated Backend (BE).
5.  **Test Remediation:**
    - Select the **"Slow Failure"** case and submit a transaction.
    - After it fails, a "Remediation Control" panel will appear.
    - Click **"Re-check Status"** to see a simulation of the reconciliation process.

---

## Technology Stack

- **Framework:** React with TypeScript (TSX)
- **Styling:** Tailwind CSS
- **Build:** In-browser compilation via Babel (for demo purposes). No local build step is required.
- **Backend:** All backend logic is simulated client-side using `Promise` and `setTimeout` to control response times and outcomes deterministically.
