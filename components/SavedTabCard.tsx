import React from 'react';
import { SavedTab } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import Favicon from './Favicon';
import { GripVerticalIcon } from './icons/GripVerticalIcon';

interface SavedTabCardProps {
  tab: SavedTab;
  onOpen: (tab: SavedTab) => void;
  onDelete: (tabId: string) => void;
  onEdit: (tab: SavedTab) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, tabId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, tabId: string) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  isDragOver: boolean;
}

const SavedTabCard: React.FC<SavedTabCardProps> = ({ 
  tab, onOpen, onDelete, onEdit, 
  onDragStart, onDragOver, onDragEnter, onDragLeave, onDrop, onDragEnd,
  isDragging, isDragOver 
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, tab.id)}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, tab.id)}
      onDragEnd={onDragEnd}
      className={`
        bg-white dark:bg-zinc-800 p-3 rounded-lg flex items-center gap-4 group transition-all duration-200
        ${isDragging ? 'opacity-30' : 'opacity-100'}
        ${isDragOver ? 'border-t-2 border-blue-500 pt-[10px] -mt-0.5' : 'border-t-2 border-transparent'}
      `}
    >
      <div className="cursor-grab text-zinc-400 dark:text-zinc-500">
        <GripVerticalIcon className="w-5 h-5" />
      </div>
      <div className="flex-shrink-0 cursor-pointer" onClick={() => onOpen(tab)}>
        <Favicon url={tab.url} className="w-8 h-8" />
      </div>
      <div className="flex-grow min-w-0 cursor-pointer" onClick={() => onOpen(tab)}>
        <p className="font-semibold text-zinc-800 dark:text-zinc-100 truncate">{tab.name}</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{tab.url}</p>
      </div>
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {tab.embeddable === false && (
          <div title="This site may not display correctly in a tab.">
            <AlertTriangleIcon className="w-5 h-5 text-yellow-500" />
          </div>
        )}
        <button
          onClick={() => onEdit(tab)}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          aria-label={`Edit ${tab.name}`}
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(tab.id)}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          aria-label={`Delete ${tab.name}`}
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SavedTabCard;