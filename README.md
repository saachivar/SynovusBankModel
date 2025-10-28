# 🧭 Tracer-Driven Watchdog Pattern for Resilient Frontend Payments  

This project is an **interactive demonstration** of the **Tracer-Driven Watchdog pattern**, a robust method for handling slow or unreliable backend operations in frontend applications. It showcases how to prevent duplicate transactions and maintain user trust during critical financial operations such as payments and transfers.  

Built with **React**, **TypeScript**, and **Tailwind CSS**, this demo emphasizes reliability, observability, and user experience under uncertain network conditions.  

🔗 View it on a page!
**https://akira23456.github.io/SynovusBankModel/**  

---

## 🧩 The Problem: The “Double-Click” Dilemma  

Imagine a user on a banking website clicks **“Pay Bill”**:  

1. A loading spinner appears, but seconds pass with no response.  
2. The user becomes anxious — is the payment processing or is the site broken?  
3. Out of frustration, they click again or refresh the page.  

These actions can cause **duplicate charges**, **lost transaction context**, and **customer support headaches**, ultimately eroding user trust.  

---

## 🧠 The Solution: The Tracer-Driven Watchdog  

The **Tracer-Driven Watchdog** introduces a **client-side safety net** to gracefully handle backend latency and uncertainty.  

### ⚙️ How It Works  

1. **Initiate & Trace**  
   - When the user clicks “Pay,” the frontend:  
     - Generates a unique **traceId** for the transaction.  
     - Starts a **span** (a trace unit) representing the payment process.  
     - Arms a **watchdog timer** (e.g., 9 seconds).  

2. **Watchdog “Bite”**  
   - If the backend responds **before** the timeout → normal flow continues.  
   - If not → the **watchdog triggers**, indicating perceived frontend latency.  

3. **Inform & Secure**  
   - The UI transitions to a **“Pending Confirmation”** state.  
   - The user is informed that the payment is being processed and **should not retry**.  
   - A `watchdog.triggered` event is logged for observability.  

4. **Reconcile**  
   - When the backend finally responds (success or failure), the frontend updates the UI accordingly.  
   - Because the user already saw “Pending,” the transition feels natural and trustworthy.  

✅ **Result:** The request is sent once, the UI remains clear, and the overall experience feels reliable and consistent.  

---

## 💻 Live Demo Features  

This application lets you **experience** the watchdog pattern in action across simulated banking features: **Payments**, **Transfers**, and **Send & Receive**.  

### 1. 🔄 Interactive Scenarios  

Choose from four backend behaviors to observe how the watchdog responds:  

- **Random:** Simulates realistic network latency (25% chance of slow response).  
- **Fast Success:** The backend always responds quickly — watchdog armed but never triggered.  
- **Slow Success:** Guaranteed watchdog trigger before eventual success.  
- **Slow Failure:** The backend is slow and ultimately fails, testing how “Pending” transitions to “Failed.”  

---

### 2. 📊 Real-Time Visualization  

Each transaction includes a comprehensive view of the process:  

- **Payment/Transfer Terminal:**  
  Intuitive interface showing transaction progress (`Processing`, `Pending`, `Success`, or `Failed`).  
- **Live Event Log:**  
  Timestamped log of frontend (FE) and backend (BE) events, narrating the transaction lifecycle.  
- **Tracer View:**  
  Live visualization of frontend code execution — lines are highlighted in real time to show trace creation, attribute addition, watchdog arming, and response handling.  
- **Dual-Perspective Tracing (Send & Receive):**  
  A split view displaying **sender** and **receiver** traces simultaneously, illustrating **trace propagation across systems** for end-to-end observability.  

---

### 3. 🩺 Transaction Remediation  

In some cases, transactions may fail due to **network timeouts** or uncertain backend responses. The **Activity** tab includes a remediation mechanism:  

- Failed transactions display a **“Re-check Status”** button.  
- This triggers a **remediation trace**, simulating a backend status query.  
- Occasionally, a “failed” transaction may be reconciled as **successful**, demonstrating real-world recovery scenarios.  

This ensures eventual consistency and reinforces user trust, even after temporary failures.  

---

## 🛠️ Tech Stack  

- **Frontend:** React, TypeScript, Tailwind CSS  
- **State Management:** React Hooks, Context API  
- **Tracing Simulation:** Custom trace/span event handling with real-time highlighting  
- **Build Tools:** Vite + ESLint + Prettier  

---

## 🚀 Getting Started  

# Clone the repository
git clone [YOUR_REPO_LINK_HERE]

# Navigate to the project folder
cd tracer-watchdog-demo

# Install dependencies
npm install

# Run the development server
npm run dev

Then open http://localhost:5173
 in your browser.

 This project is licensed under the MIT License — free for learning, modification, and open-source collaboration.
