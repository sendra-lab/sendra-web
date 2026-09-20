import React, {type ReactNode, useEffect, useRef} from 'react';
import {translate} from '@docusaurus/Translate';
import type {CopyStatus} from './clipboard';
import {AlertIcon, CheckIcon, CloseIcon, CopyIcon} from './icons';
import styles from './styles.module.css';

type Props = {
  markdown: string;
  copyStatus: CopyStatus;
  copyLabel: string;
  onCopy: () => void;
  onClose: () => void;
};

/**
 * Shows the generated Markdown as raw, selectable text in a native modal
 * `<dialog>`: the browser supplies the focus trap, Escape-to-close, inert
 * background, and top-layer stacking, so none of that is reimplemented here.
 * A read-only `<textarea>` (not `<pre>`) keeps Ctrl/Cmd+A scoped to the
 * Markdown and gives keyboard scrolling and touch selection for free.
 */
export default function MarkdownDialog({
  markdown,
  copyStatus,
  copyLabel,
  onCopy,
  onClose,
}: Props): ReactNode {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
    // The modal doesn't stop the page behind it from scrolling.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Close through the element so its `close` event (the single `onClose`
  // path, which also fires for Escape) runs once the modal has released the
  // page — focus can't be restored to the trigger while it's still inert.
  const requestClose = () => dialogRef.current?.close();

  const title = translate({
    message: 'Page as Markdown',
    id: 'copyPage.dialog.title',
    description: 'Title of the dialog showing the raw Markdown of the page',
  });
  const closeLabel = translate({
    message: 'Close',
    id: 'copyPage.dialog.close',
    description: 'Label of the button that closes the Markdown dialog',
  });

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="copy-page-dialog-title"
      onClose={onClose}
      // Only the backdrop (the <dialog> itself, which has no padding) is
      // outside the inner panel.
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}>
      <div className={styles.dialogPanel}>
        <div className={styles.dialogHeader}>
          <h2 id="copy-page-dialog-title" className={styles.dialogTitle}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={closeLabel}
            title={closeLabel}
            onClick={requestClose}>
            <CloseIcon />
          </button>
        </div>
        <textarea
          className={styles.dialogText}
          value={markdown}
          readOnly
          spellCheck={false}
          aria-label={title}
        />
        <div className={styles.dialogFooter}>
          <button type="button" className={styles.dialogButton} onClick={onCopy}>
            {copyStatus === 'copied' ? (
              <CheckIcon />
            ) : copyStatus === 'error' ? (
              <AlertIcon />
            ) : (
              <CopyIcon />
            )}
            <span>{copyLabel}</span>
          </button>
          <button type="button" className={styles.dialogButton} onClick={requestClose}>
            {closeLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
