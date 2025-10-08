import React from 'react';
import { InternalTab } from '../types';
import { XIcon } from './icons/XIcon';
import Favicon from './Favicon';

interface InternalTabStripProps {
  tabs: InternalTab[];
  activeTabId: string | null;
  onSwitchTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
}

const InternalTabStrip: React.FC<InternalTabStripProps> = ({ tabs, activeTabId, onSwitchTab, onCloseTab }) => {
  const getTabTitle = (url: string) => {
    if (url === 'about:blank' || !url) return 'New Tab';
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, '');
    } catch (e) {
      return 'Invalid URL';
    }
  };

  return (
    <div className="px-2 pt-1 pb-2 flex items-center overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-zinc-100 dark:scrollbar-track-zinc-800">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => onSwitchTab(tab.id)}
          className={`flex items-center gap-2 max-w-xs cursor-pointer border-b-2 py-2 px-3 text-sm transition-colors ${
            activeTabId === tab.id
              ? 'border-blue-500 bg-zinc-200 dark:bg-zinc-700/50 text-zinc-900 dark:text-white'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/30 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Favicon url={tab.url} className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{getTabTitle(tab.url)}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCloseTab(tab.id);
            }}
            className="p-1 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            aria-label={`Close tab ${getTabTitle(tab.url)}`}
          >
            <XIcon className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default InternalTabStrip;