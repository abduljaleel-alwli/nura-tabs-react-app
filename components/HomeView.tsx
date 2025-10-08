import React, { useState, useMemo } from 'react';
import { SavedTab, SavedGroup } from '../types';
import SavedTabCard from './SavedTabCard';
import { SearchIcon } from './icons/SearchIcon';
import { PlusIcon } from './icons/PlusIcon';
import { FolderCogIcon } from './icons/FolderCogIcon';
import { GripVerticalIcon } from './icons/GripVerticalIcon';
import { BoxArrowUpRightIcon } from './icons/BoxArrowUpRightIcon';
import Footer from './Footer';

interface HomeViewProps {
  savedTabs: SavedTab[];
  savedGroups: SavedGroup[];
  onOpen: (savedTab: SavedTab) => void;
  onDeleteTab: (tabId: string) => void;
  onEditTab: (tab: SavedTab) => void;
  onNewTab: () => void;
  onOpenAddModal: () => void;
  onOpenManageGroupsModal: () => void;
  onOpenGroup: (groupId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onReorderGroups: (draggedGroupId: string, targetGroupId: string) => void;
  onReorderTabs: (draggedTabId: string, targetTabId: string) => void;
  onMoveTabToGroup: (tabId: string, groupId: string | null) => void;
}

const HomeView: React.FC<HomeViewProps> = ({
  savedTabs,
  savedGroups,
  onOpen,
  onDeleteTab,
  onEditTab,
  onNewTab,
  onOpenAddModal,
  onOpenManageGroupsModal,
  onOpenGroup,
  searchQuery,
  onSearchChange,
  onReorderGroups,
  onReorderTabs,
  onMoveTabToGroup,
}) => {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggedItemType, setDraggedItemType] = useState<'tab' | 'group' | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropTargetType, setDropTargetType] = useState<'tab' | 'group' | 'group-area' | null>(null);

  const uncategorizedTabs = useMemo(
    () => savedTabs.filter((tab) => !tab.groupId),
    [savedTabs]
  );

  const groupedTabs = useMemo(() => {
    const groups: { [key: string]: SavedTab[] } = {};
    savedTabs.forEach((tab) => {
      if (tab.groupId) {
        if (!groups[tab.groupId]) {
          groups[tab.groupId] = [];
        }
        groups[tab.groupId].push(tab);
      }
    });
    return groups;
  }, [savedTabs]);

  const handleDragStart = (e: React.DragEvent, id: string, type: 'tab' | 'group') => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItemId(id);
    setDraggedItemType(type);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDraggedItemType(null);
    setDropTargetId(null);
    setDropTargetType(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDragEnter = (e: React.DragEvent, id: string, type: 'tab' | 'group' | 'group-area') => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedItemId && draggedItemId !== id) {
      if (draggedItemType === 'tab' && (type === 'tab' || type === 'group-area')) {
        setDropTargetId(id);
        setDropTargetType(type);
      } else if (draggedItemType === 'group' && type === 'group') {
        setDropTargetId(id);
        setDropTargetType(type);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // A timeout helps prevent flickering when moving over child elements
    setTimeout(() => {
      setDropTargetId(null);
      setDropTargetType(null);
    }, 100);
  };
  
  const handleDropOnTab = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedItemType === 'tab' && draggedItemId && draggedItemId !== targetTabId) {
      onReorderTabs(draggedItemId, targetTabId);
    }
    handleDragEnd();
  };

  const handleDropOnGroupArea = (e: React.DragEvent, targetGroupId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedItemType === 'tab' && draggedItemId) {
      const draggedTab = savedTabs.find(t => t.id === draggedItemId);
      if (draggedTab && (draggedTab.groupId || null) !== (targetGroupId || null)) {
        onMoveTabToGroup(draggedItemId, targetGroupId);
      }
    }
    handleDragEnd();
  };

  const handleDropOnGroup = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedItemType === 'group' && draggedItemId && draggedItemId !== targetGroupId) {
      onReorderGroups(draggedItemId, targetGroupId);
    }
    handleDragEnd();
  };

  const renderTabList = (tabs: SavedTab[], groupId: string | null) => (
    <div
      className="space-y-2 min-h-[60px] p-1 -m-1"
      onDragEnter={(e) => handleDragEnter(e, groupId || 'uncategorized', 'group-area')}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDropOnGroupArea(e, groupId)}
    >
      {tabs.map((tab) => (
        <SavedTabCard
          key={tab.id}
          tab={tab}
          onOpen={onOpen}
          onDelete={onDeleteTab}
          onEdit={onEditTab}
          onDragStart={(e) => {
            e.stopPropagation();
            handleDragStart(e, tab.id, 'tab');
          }}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, tab.id, 'tab')}
          onDragLeave={handleDragLeave}
          onDrop={handleDropOnTab}
          onDragEnd={handleDragEnd}
          isDragging={draggedItemType === 'tab' && draggedItemId === tab.id}
          isDragOver={dropTargetType === 'tab' && dropTargetId === tab.id}
        />
      ))}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">Welcome Back</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-2">Your saved tabs, all in one place.</p>
      </header>
      
      <div className="sticky top-0 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-sm z-10 py-4 mb-6 -mx-8 px-8 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search tabs by name or URL..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={onOpenAddModal}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-100 dark:focus:ring-offset-zinc-900 focus:ring-blue-500"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Add Tab</span>
          </button>
           <button
            onClick={onOpenManageGroupsModal}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-zinc-600 dark:bg-zinc-700 text-white font-semibold rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-100 dark:focus:ring-offset-zinc-900 focus:ring-zinc-500"
          >
            <FolderCogIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Manage Groups</span>
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {savedGroups.map((group) => {
            const groupTabCount = groupedTabs[group.id]?.length || 0;
            return (
                <div
                    key={group.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, group.id, 'group')}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, group.id, 'group')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDropOnGroup(e, group.id)}
                    onDragEnd={handleDragEnd}
                    className={`
                    p-4 rounded-lg transition-all duration-200 bg-zinc-200/30 dark:bg-zinc-800/50
                    ${draggedItemType === 'group' && draggedItemId === group.id ? 'opacity-30' : 'opacity-100'}
                    ${dropTargetType === 'group' && dropTargetId === group.id ? 'border-t-2 border-blue-500 pt-2 -mt-1' : 'border-t-2 border-transparent'}
                    `}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 flex-grow min-w-0 cursor-grab">
                            <GripVerticalIcon className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 truncate">{group.name}</h2>
                            <span className="text-xs font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-full">
                                {groupTabCount}
                            </span>
                        </div>
                        <button
                            onClick={() => onOpenGroup(group.id)}
                            disabled={groupTabCount === 0}
                            className="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Open all tabs in ${group.name}`}
                            title="Open all tabs in group"
                        >
                            <BoxArrowUpRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                    {groupTabCount > 0 ? (
                    renderTabList(groupedTabs[group.id], group.id)
                    ) : (
                    <div 
                        className="text-zinc-500 dark:text-zinc-500 text-center py-4 rounded-md border-2 border-dashed border-zinc-300 dark:border-zinc-700 min-h-[60px] flex items-center justify-center"
                        onDragEnter={(e) => handleDragEnter(e, group.id, 'group-area')}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropOnGroupArea(e, group.id)}
                    >
                        Drag tabs here to add to this group.
                    </div>
                    )}
                </div>
            )
        })}

        {savedTabs.length > 0 && (
            <div className="p-4 rounded-lg bg-zinc-200/20 dark:bg-zinc-800/30">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">Uncategorized</h2>
                        <span className="text-xs font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-full">
                            {uncategorizedTabs.length}
                        </span>
                    </div>
                    <button
                        onClick={() => onOpenGroup(null)}
                        disabled={uncategorizedTabs.length === 0}
                        className="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Open all uncategorized tabs"
                        title="Open all uncategorized tabs"
                    >
                        <BoxArrowUpRightIcon className="w-5 h-5" />
                    </button>
                </div>
              {uncategorizedTabs.length > 0 ? (
                renderTabList(uncategorizedTabs, null)
              ) : (
                <div 
                  className="text-zinc-500 dark:text-zinc-500 text-center py-4 rounded-md border-2 border-dashed border-zinc-300 dark:border-zinc-700 min-h-[60px] flex items-center justify-center"
                  onDragEnter={(e) => handleDragEnter(e, 'uncategorized', 'group-area')}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnGroupArea(e, null)}
                >
                  No uncategorized tabs.
                </div>
              )}
            </div>
        )}

        {savedTabs.length === 0 && searchQuery === '' && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">No Tabs Saved Yet</h2>
            <p className="text-zinc-500 dark:text-zinc-500 mt-2">Click "Add Tab" or open a new tab and save it to get started.</p>
            <button
              onClick={onNewTab}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-100 dark:focus:ring-offset-zinc-900 focus:ring-blue-500"
            >
              <PlusIcon className="w-5 h-5" />
              Open First Tab
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default HomeView;