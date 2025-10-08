import React from 'react';

interface ConfirmDeleteGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  groupName?: string;
}

const ConfirmDeleteGroupModal: React.FC<ConfirmDeleteGroupModalProps> = ({ isOpen, onClose, onConfirm, groupName }) => {
  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-group-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-delete-group-modal-title" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Confirm Deletion</h2>
        <p className="text-zinc-700 dark:text-zinc-300 mt-2">
          Are you sure you want to delete the group: <strong className="break-all">{groupName}</strong>?
        </p>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
          Tabs in this group will not be deleted; they will become uncategorized.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-200 dark:bg-zinc-600 text-zinc-800 dark:text-white font-semibold rounded-md text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-800 focus:ring-zinc-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md text-sm hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-800 focus:ring-red-500"
          >
            Delete Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteGroupModal;