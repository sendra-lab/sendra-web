export type CopyStatus = 'idle' | 'copied' | 'error';

/**
 * Copies text to the clipboard, resolving to whether it worked. Uses the
 * async Clipboard API where available (secure contexts), otherwise falls
 * back to the legacy `execCommand('copy')` path; never throws.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied, insecure context, or unfocused document: try the
    // legacy path below before giving up.
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  const previouslyFocused = document.activeElement as HTMLElement | null;
  document.body.appendChild(textarea);
  try {
    textarea.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
    previouslyFocused?.focus?.();
  }
}
