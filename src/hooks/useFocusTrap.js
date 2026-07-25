import { useEffect, useRef } from "react";

/**
 * Focus trap hook for modals/dialogs.
 * - Traps Tab / Shift+Tab within the container
 * - Saves and restores the previously focused element
 * - Returns a ref to attach to the modal container
 */
export function useFocusTrap(active) {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    // Save previously focused element
    previousFocusRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    // Focus the first focusable element inside the modal
    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const firstFocusable = container.querySelector(focusableSelector);
    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      container.setAttribute("tabindex", "-1");
      container.focus();
    }

    function handleKeyDown(e) {
      if (e.key !== "Tab") return;

      const focusableElements = container.querySelectorAll(focusableSelector);
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstEl = focusableElements[0];
      const lastEl = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus to the previously focused element
      if (
        previousFocusRef.current &&
        typeof previousFocusRef.current.focus === "function"
      ) {
        previousFocusRef.current.focus();
      }
    };
  }, [active]);

  return containerRef;
}
