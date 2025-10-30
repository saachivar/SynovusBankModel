// The frontend timeout before showing the "still processing" message.
// The prompt specifies a closing time of 14 seconds. We set our watchdog lower.
export const WATCHDOG_TIMEOUT_MS = 9000; // 9 seconds

// The frontend threshold for when a transaction is considered "high-risk" of failure.
export const LIKELY_TO_FAIL_THRESHOLD_MS = 13000; // 13 seconds