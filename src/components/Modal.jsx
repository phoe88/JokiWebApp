import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

/** A native dialog, so focus handling, Escape and the backdrop come from the browser. */
export default function Modal({ open, onClose, title, icon: Icon, wide = false, children }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className={`dialog ${wide ? 'dialog--wide' : ''}`}
    >
      {open && (
        <div className="glass-raised animate__animated animate__fadeInUp animate__faster p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 id={titleId} className="flex min-w-0 items-center gap-2.5 font-display text-lg font-bold text-ink">
              {Icon && (
                <span className="icon-chip icon-chip--live">
                  <Icon aria-hidden className="size-4" />
                </span>
              )}
              {title}
            </h2>
            <button type="button" onClick={onClose} aria-label="Tutup" className="icon-btn">
              <X aria-hidden className="size-4" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
