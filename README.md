Tracer-Driven Watchdog Pattern for Resilient Frontend Payments
This project is an interactive demonstration of a Tracer-Driven Watchdog pattern, a robust method for handling slow or unreliable backend operations in a frontend application. It showcases how to prevent common issues like duplicate transactions and provide a clear, trustworthy user experience, especially during critical financial operations.
The entire application is built using React, TypeScript, and Tailwind CSS.
The Problem: The "Double-Click" Dilemma
Imagine a user on a banking website clicks "Pay Bill". A loading spinner appears. Seconds pass, and there's no response from the server. What does the user do?
They wait anxiously, unsure if the payment is processing or if the site is broken.
They get impatient and click "Pay Bill" again, potentially leading to a duplicate charge.
They refresh the page, losing the transaction context entirely and leaving the payment in an unknown state.
These scenarios lead to a poor user experience, a lack of trust, and potential financial errors that require costly customer support intervention.
The Solution: A Tracer-Driven Watchdog
This pattern provides a client-side safety net to gracefully handle backend latency. It works in a few simple steps:
Initiate & Trace: When a user clicks "Pay", the frontend immediately:
Generates a unique traceId for the entire operation.
Starts a "span" (a unit of work in a trace) to represent the payment process.
Arms a watchdog timer (setTimeout) with a predefined timeout (e.g., 9 seconds).
The Watchdog "Bite":
If the backend responds quickly (before the timeout), the watchdog timer is cleared, and the flow proceeds normally.
If the backend is slow and the timer finishes, the watchdog "bites".
Inform & Secure: When the watchdog bites, the frontend doesn't just wait. It proactively:
Updates the UI to a "Pending Confirmation" state. This assures the user their request is safe, has been received, and is being processed. It explicitly tells them not to submit again.
Adds a "watchdog.triggered" event to the transaction's trace, providing observability into frontend-perceived latency.
Reconcile: When the backend finally responds (whether with success or failure), the frontend updates the UI with the final, authoritative status. Because the state was already "Pending," the user knows the system handled the delay correctly.
This pattern ensures that the user's request is sent only once, the UI remains informative, and the system's state remains consistent.
Live Demo Features
This application allows you to experience the pattern firsthand across different banking features.
1. Interactive Scenarios
On the Payments, Transfers, and Send & Receive tabs, you can select one of four simulated backend behaviors to see how the watchdog reacts:
Random: Simulates a real-world network with a 25% chance of a slow response that will trigger the watchdog.
Fast Success: The backend always responds quickly. The watchdog is armed but never triggers.
Slow Success: The backend is intentionally slow, guaranteeing the watchdog will trigger before the final success message arrives.
Slow Failure: The backend is very slow and ultimately fails, showing how the "Pending" state can resolve to a final "Failed" status.
2. Real-time Visualization
For every transaction, the application provides a detailed, multi-faceted view of the process:
Payment/Transfer Terminal: A user-friendly interface to initiate transactions and see the final status (Processing, Pending, Success, or Failed).
Live Event Log: A real-time log showing events from both the Frontend (FE) and the simulated Backend (BE), providing a clear, timestamped narrative of the entire transaction flow.
Tracer View: A powerful visualization that shows a simplified frontend code snippet. The currently executing line of code is highlighted in real-time, demonstrating exactly how the trace is created, attributes are added, the watchdog is armed, and the final response is handled.
Dual-Perspective Tracing (Send & Receive): The "Send & Receive" tab features a unique split view showing the sender's trace and the recipient's trace simultaneously. This demonstrates how a trace context can be propagated across systems to provide end-to-end observability.
3. Transaction Remediation
Sometimes, a transaction can fail due to a network timeout where the final status is unknown. The Activity tab simulates a solution for this.
Failed transactions can be re-checked using a "Re-check Status" button.
This triggers a remediation trace that simulates querying an authoritative backend system for the transaction's true final status.
In the demo, there is a small chance that the "failed" transaction actually succeeded on the backend. The remediation process will find this, reconcile the transaction as successful, and update the user's account balance accordingly.

