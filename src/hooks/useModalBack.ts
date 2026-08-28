"use client";

import { useEffect, useRef } from "react";

/**
 * Makes a modal respond to the native back button.
 * When `isOpen` becomes true, pushes a history state entry.
 * When the user presses back (popstate), calls onClose.
 *
 * Usage:
 *   useModalBack(isOpen, onClose);
 */
export function useModalBack(isOpen: boolean, onClose: () => void) {
  const hasPushed = useRef(false);
  const onCloseRef = useRef(onClose);

  // Keep onClose ref fresh
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isOpen && !hasPushed.current) {
      // Push a dummy history entry so back button triggers popstate
      window.history.pushState({ modal: true }, "");
      hasPushed.current = true;

      const handlePopState = () => {
        // Close the modal instead of navigating away
        hasPushed.current = false;
        onCloseRef.current();
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }

    if (!isOpen) {
      hasPushed.current = false;
    }
  }, [isOpen]);
}
