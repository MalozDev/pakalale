"use client";

import { useEffect } from "react";

/**
 * Suppresses noisy browser extension errors like:
 * - "Could not establish connection. Receiving end does not exist."
 * - "Unchecked runtime.lastError"
 * These come from extensions like React DevTools, not from the app.
 */
export default function SuppressExtensionErrors() {
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      const msg = event.message || "";
      if (
        msg.includes("Could not establish connection") ||
        msg.includes("Receiving end does not exist") ||
        msg.includes("runtime.lastError") ||
        msg.includes("forward-logs-shared")
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
      }
    };

    // Suppress unhandled promise rejections from extensions
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const reason = String(event.reason?.message || event.reason || "");
      if (
        reason.includes("Could not establish connection") ||
        reason.includes("Receiving end does not exist") ||
        reason.includes("runtime.lastError")
      ) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener("error", handler, true);
    window.addEventListener("unhandledrejection", rejectionHandler, true);

    return () => {
      window.removeEventListener("error", handler, true);
      window.removeEventListener("unhandledrejection", rejectionHandler, true);
    };
  }, []);

  return null;
}
