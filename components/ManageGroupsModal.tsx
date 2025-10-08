import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/XIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SavedGroup, SavedTab } from '../types';
import { GripVerticalIcon } from './icons/GripVerticalIcon';
import { CheckIcon } from './icons/CheckIcon';

interface ManageGroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: SavedGroup[];
  savedTabs: SavedTab[];
  onAddGroup: (name: string) => void;
  onUpdateGroup: (group: SavedGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onReorderGroups: (draggedGroupId: string, targetGroupId: string) => void;
}

const ManageGroupsModal: React.FC<ManageGroupsModalProps> = ({ isOpen, onClose, groups, savedTabs, onAddGroup, onUpdateGroup, onDeleteGroup, onReorderGroups }) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [draggedGroupId, setDraggedGroupId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<{ id: string, name: string } | null>(null);


  useEffect(() => {
    if (isOpen) {
      setNewGroupName('');
      setEditingGroup(null);
    }
  }, [isOpen]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      onAddGroup(newGroupName.trim());
      setNewGroupName('');
    }
  };
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGroup && editingGroup.name.trim()) {
      onUpdateGroup({ id: editingGroup.id, name: editingGroup.name.trim() });
      setEditingGroup(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, groupId: string) => {
    e.dataTransfer.setData('text/plain', groupId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedGroupId(groupId);
  };

  const handleDragOver = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    if (draggedGroupId && draggedGroupId !== groupId) {
      setDropTargetId(groupId);
    }
  };
  
  const handleDragLeave = () => {
    setDropTargetId(null);
  };

  const handleDrop = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== targetGroupId) {
        onReorderGroups(draggedId, targetGroupId);
    }
    setDraggedGroupId(null);
    setDropTargetId(null);
  };

  const handleDragEnd = () => {
    setDraggedGroupId(null);
    setDropTargetId(null);
  };


  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-groups-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl w-full max-w-md p-6 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
            <h2 id="manage-groups-modal-title" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Manage Groups</h2>
            <button
                onClick={onClose}
                className="p-1 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-800 focus:ring-blue-500"
                aria-label="Close"
            >
                <XIcon className="w-5 h-5" />
            </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Add new group name..."
                    className="flex-grow px-3 py-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-md border border-zinc-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="New group name"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md text-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-800 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newGroupName.trim()}
                    aria-label="Add group"
                >
                    Add
                </button>
            </form>
            <hr className="border-zinc-200 dark:border-zinc-700 mb-4" />
        </div>

        <div className="overflow-y-auto pr-2 -mr-2 space-y-2">
          {groups.length > 0 ? (
            groups.map((group) => {
              const tabCount = savedTabs.filter(tab => tab.groupId === group.id).length;
              return (
              <div 
                key={group.id}
                draggable={!editingGroup}
                onDragStart={(e) => handleDragStart(e, group.id)}
                onDragOver={(e) => handleDragOver(e, group.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, group.id)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between bg-zinc-100 dark:bg-zinc-700/50 p-2 rounded-md transition-all duration-200
                  ${draggedGroupId === group.id ? 'opacity-30' : 'opacity-100'}
                  ${dropTargetId === group.id ? 'border-t-2 border-blue-500' : 'border-t-2 border-transparent'}
                `}
              >
                {editingGroup?.id === group.id ? (
                  <form onSubmit={handleEditSubmit} className="flex-grow flex items-center gap-2">
                    <input
                      type="text"
                      value={editingGroup.name}
                      onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                      className="flex-grow px-2 py-1 bg-zinc-200 dark:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-md border border-zinc-400 dark:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setEditingGroup(null);
                        }
                      }}
                    />
                    <div className="flex items-center">
                      <button
                        type="submit"
                        className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        aria-label="Save group name"
                        disabled={!editingGroup.name.trim()}
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingGroup(null)}
                        className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        aria-label="Cancel editing"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-grow min-w-0">
                        <button className="cursor-grab text-zinc-400 dark:text-zinc-500 flex-shrink-0" aria-label={`Drag to reorder ${group.name}`}>
                            <GripVerticalIcon className="w-5 h-5" />
                        </button>
                        <span className="text-zinc-800 dark:text-zinc-200 truncate">{group.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-medium bg-zinc-200 dark:bg-zinc-600 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-full">{tabCount}</span>
                      <button
                        onClick={() => setEditingGroup({ id: group.id, name: group.name })}
                        className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        aria-label={`Edit group ${group.name}`}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteGroup(group.id)}
                        className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        aria-label={`Delete group ${group.name}`}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )})
          ) : (
            <p className="text-zinc-500 dark:text-zinc-500 text-center py-4">No groups created yet.</p>
          )}
        </div>
        <div className="mt-6 flex-shrink-0 flex justify-end">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-600 text-zinc-800 dark:text-white font-semibold rounded-md text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-800 focus:ring-zinc-500"
            >
                Done
            </button>
        </div>
      </div>
    </div>
  );
};

export default ManageGroupsModal;