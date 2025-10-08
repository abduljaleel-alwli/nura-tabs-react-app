import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/XIcon';
import { SavedGroup } from '../types';

interface SaveTabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string, groupId?: string }) => void;
  initialUrl?: string;
  groups: SavedGroup[];
}

const SaveTabModal: React.FC<SaveTabModalProps> = ({ isOpen, onClose, onSave, initialUrl, groups }) => {
  const [name, setName] = useState('');
  const [groupId, setGroupId] = useState('');

  useEffect(() => {
    if (isOpen) {
        try {
            const hostname = new URL(initialUrl || '').hostname;
            setName(hostname.replace(/^www\./, ''));
        } catch (e) {
            setName(initialUrl || '');
        }
      setGroupId('');
    }
  }, [isOpen, initialUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ name: name.trim(), groupId: groupId || undefined });
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-tab-modal-title"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="save-tab-modal-title" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Save Tab</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-800 focus:ring-blue-500"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2 break-all">
          URL: <span className="font-mono text-zinc-700 dark:text-zinc-300">{initialUrl}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tab-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Tab Name
            </label>
            <input
              id="tab-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-md border border-zinc-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
              onFocus={(e) => e.target.select()}
              required
            />
          </div>
          <div>
            <label htmlFor="save-tab-group" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Group (Optional)
            </label>
            <select
              id="save-tab-group"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-md border border-zinc-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Uncategorized</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-600 text-zinc-800 dark:text-white font-semibold rounded-md text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-800 focus:ring-zinc-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md text-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-800 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!name.trim()}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveTabModal;