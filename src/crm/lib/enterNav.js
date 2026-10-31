/**
 * Handles Enter key navigation across forms:
 * When a user presses Enter in an input or select field, focus moves to the next
 * input option instead of prematurely submitting or getting stuck.
 */
export function handleEnterKeyNavigation(e) {
  if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
    return;
  }

  const target = e.target;
  if (!target || !(target instanceof HTMLElement)) return;

  // Let multiline textarea handle normal newlines
  if (target.tagName === 'TEXTAREA') return;

  // Let buttons, links, and switches handle native Enter activation (unless it's a combobox)
  if (target.tagName === 'BUTTON' && target.getAttribute('role') !== 'combobox') {
    return;
  }
  if (target.tagName === 'A' || target.getAttribute('role') === 'switch') {
    return;
  }

  // If inside an open dropdown/menu, let Radix or native select handle option selection
  if (target.getAttribute('role') === 'option' || target.closest('[role="listbox"]')) {
    return;
  }

  const isInput =
    target.tagName === 'INPUT' ||
    target.tagName === 'SELECT' ||
    (target.getAttribute('role') === 'combobox' && target.getAttribute('aria-expanded') !== 'true');

  if (!isInput) return;

  // Find enclosing form, modal/dialog, card, or body
  const container =
    target.closest('form') ||
    target.closest('[role="dialog"]') ||
    target.closest('.pt-card') ||
    document.body;

  const selector = [
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([disabled]):not([readonly])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[role="combobox"]:not([disabled])',
    'button[type="submit"]:not([disabled])',
  ].join(', ');

  const elements = Array.from(container.querySelectorAll(selector)).filter((el) => {
    // Only visible & focusable elements
    return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
  });

  const currentIndex = elements.indexOf(target);
  if (currentIndex !== -1 && currentIndex < elements.length - 1) {
    const next = elements[currentIndex + 1];

    // If next is the submit button, focus it
    if (next.getAttribute('type') === 'submit' || (next.tagName === 'BUTTON' && next.getAttribute('role') !== 'combobox')) {
      e.preventDefault();
      next.focus();
      return;
    }

    // Move to the next input option
    e.preventDefault();
    next.focus();
    if (next instanceof HTMLInputElement && typeof next.select === 'function' && next.type !== 'date') {
      next.select();
    }
    next.scrollIntoView?.({ block: 'nearest' });
  }
}
