import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/XIcon';
import { SavedTab, SavedGroup } from '../types';

interface EditTabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTab: SavedTab) => void;
  tab: SavedTab | null;
  groups: SavedGroup[];
}

const EditTabModal: React.FC<EditTabModalProps> = ({ isOpen, onClose, onSave, tab, groups }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [groupId, setGroupId] = useState('');

  useEffect(() => {
    if (isOpen && tab) {
      setName(tab.name);
      setUrl(tab.url);
      setGroupId(tab.groupId || '');
    }
  }, [isOpen, tab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab && name.trim() && url.trim()) {
      onSave({ ...tab, name: name.trim(), url: url.trim(), groupId: groupId || undefined });
    }
  };

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(?:com|org|net|gov|edu|io|co|ai|dev|app|tech)[^\s]*)/i;
    const match = pastedText.match(urlRegex);
    
    if (match) {
      e.preventDefault();
      setUrl(match[0]);
    }
  };

  if (!isOpen || !tab) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-tab-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="edit-tab-modal-title" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Edit Saved Tab</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-800 focus:ring-blue-500"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-tab-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Tab Name
            </label>
            <input
              id="edit-tab-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-md border border-zinc-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
              required
            />
          </div>
          <div>
            <label htmlFor="edit-tab-url" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              URL
            </label>
            <input
              id="edit-tab-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onPaste={handleUrlPaste}
              className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-md border border-zinc-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-tab-group" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Group
            </label>
            <select
              id="edit-tab-group"
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
              disabled={!name.trim() || !url.trim()}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTabModal;