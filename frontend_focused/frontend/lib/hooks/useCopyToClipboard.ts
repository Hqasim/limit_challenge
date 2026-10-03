'use client';

import { useCallback, useState } from 'react';

// Copies text to the clipboard and keeps a short message about the result, for a snackbar.
// The Clipboard API can be missing (non-HTTPS origins) or blocked by the browser; the user is
// then told plainly instead of the click silently doing nothing.
export function useCopyToClipboard() {
  const [feedback, setFeedback] = useState({ open: false, message: '' });

  const copy = useCallback(async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback({ open: true, message: successMessage });
    } catch {
      setFeedback({ open: true, message: "Couldn't copy. Your browser blocked clipboard access." });
    }
  }, []);

  // Closing keeps the message, so the snackbar doesn't go blank while it animates out.
  const close = useCallback(() => setFeedback((current) => ({ ...current, open: false })), []);

  return { copy, feedback, close };
}
