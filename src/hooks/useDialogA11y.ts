import { RefObject, useEffect } from 'react';

const FOCUSABLE_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface UseDialogA11yOptions {
  onClose: () => void;
  containerRef: RefObject<HTMLElement | null>;
}

export function useDialogA11y({ onClose, containerRef }: UseDialogA11yOptions) {
  useEffect(() => {
    const triggerElement = document.activeElement as HTMLElement | null;
    const container = containerRef.current;

    const focusable = container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    (focusable?.[0] ?? container)?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && container) {
        const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (elements.length === 0) return;

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      triggerElement?.focus();
    };
  }, [onClose, containerRef]);
}
