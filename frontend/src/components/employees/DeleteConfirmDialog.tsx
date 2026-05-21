"use client";

import type { Employee } from "@/types/employee";

type DeleteConfirmDialogProps = {
  employee: Employee | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
};

export default function DeleteConfirmDialog({
  employee,
  isOpen,
  onConfirm,
  onCancel,
  isLoading,
}: DeleteConfirmDialogProps) {
  if (!isOpen || !employee) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-label="Delete confirmation"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="modal modal--sm">
        <div className="modal__body" style={{ textAlign: 'center', paddingTop: 28 }}>
          <div className="modal__warning-icon">⚠</div>
          <h2 className="modal__title" style={{ marginBottom: 10 }}>Deactivate Employee?</h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.6 }}>
            Are you sure you want to deactivate{' '}
            <strong>{employee.full_name}</strong>?
            <br />This action cannot be undone.
          </p>
        </div>
        <div className="modal__footer" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn btn--secondary" onClick={onCancel}>Cancel</button>
          <button
            type="button"
            className="btn btn--danger"
            aria-label="Confirm deactivate"
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading ? 'Deactivating…' : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
}
