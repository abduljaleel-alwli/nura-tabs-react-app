import React from 'react';
import { InternalTab } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SaveIcon } from './icons/SaveIcon';
import InternalTabStrip from './InternalTabStrip';
import { TabsIcon } from './icons/TabsIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import Logo from './Logo';

interface HeaderProps {
  onNewTab: () => void;
  onSaveTab: () => void;
  onGoHome: () => void;
  onGoToTabs: () => void;
  internalTabs: InternalTab[];
  activeInternalTabId: string | null;
  onSwitchTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  isBrowserView: boolean;
  isSaveDisabled: boolean;
  activeTabSavedInfo: { isSaved: boolean; groupName: string | null };
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onNewTab,
  onSaveTab,
  onGoHome,
  onGoToTabs,
  internalTabs,
  activeInternalTabId,
  onSwitchTab,
  onCloseTab,
  isBrowserView,
  isSaveDisabled,
  activeTabSavedInfo,
  theme,
  onToggleTheme
}) => {
  const hasOpenTabs = internalTabs.length > 0;
  return (
    <header className="bg-zinc-100 dark:bg-zinc-800 shadow-md z-10 sticky top-0">
      <div className="p-2 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <Logo />
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 mx-2" />
          <button
            onClick={onGoHome}
            className="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Go to Home"
          >
            <HomeIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onGoToTabs}
            className="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="View Open Tabs"
            disabled={!hasOpenTabs}
          >
            <TabsIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onNewTab}
            className="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="New Tab"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
            {isBrowserView && (
            <div className="relative group">
                <button
                onClick={onSaveTab}
                className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    activeTabSavedInfo.isSaved
                    ? 'text-blue-500 dark:text-blue-400 hover:bg-blue-400/20'
                    : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
                aria-label="Save Tab"
                disabled={isSaveDisabled}
                >
                {activeTabSavedInfo.isSaved ? (
                    <BookmarkIcon className="w-5 h-5" />
                ) : (
                    <SaveIcon className="w-5 h-5" />
                )}
                </button>
                {activeTabSavedInfo.isSaved && !isSaveDisabled && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-zinc-800 dark:bg-zinc-900 text-zinc-100 text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    Saved in: <strong>{activeTabSavedInfo.groupName || 'Uncategorized'}</strong>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-zinc-800 dark:border-t-zinc-900"></div>
                </div>
                )}
            </div>
            )}
            <button
                onClick={onToggleTheme}
                className="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
        </div>
      </div>
      {internalTabs.length > 0 && isBrowserView && (
        <InternalTabStrip
          tabs={internalTabs}
          activeTabId={activeInternalTabId}
          onSwitchTab={onSwitchTab}
          onCloseTab={onCloseTab}
        />
      )}
    </header>
  );
};

export default Header;