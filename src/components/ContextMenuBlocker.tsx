"use client";

import { useEffect } from "react";

export default function ContextMenuBlocker() {
  useEffect(() => {
    const handler = (e: Event) => {
      // Allow context menu on input/textarea/editable elements
      const target = e.target as HTMLElement;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || target?.isContentEditable) {
        return;
      }
      e.preventDefault();
    };

    document.addEventListener("contextmenu", handler, { passive: false });
    return () => document.removeEventListener("contextmenu", handler);
  }, []);

  return null;
}
