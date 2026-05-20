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
    <div role="dialog" aria-label="Delete confirmation">
      <p>{`Are you sure you want to deactivate ${employee.full_name}? This cannot be undone.`}</p>
      <button type="button" onClick={onCancel}>Cancel</button>
      <button type="button" aria-label="Confirm deactivate" disabled={isLoading} onClick={onConfirm}>
        {isLoading ? "Deactivating..." : "Deactivate"}
      </button>
    </div>
  );
}
