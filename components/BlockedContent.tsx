
import React from 'react';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

interface BlockedContentProps {
  url: string;
}

const BlockedContent: React.FC<BlockedContentProps> = ({ url }) => {
  
  const handleOpenInNewTab = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 p-4 z-10 text-center">
      <h2 className="text-xl font-bold text-red-500 dark:text-red-400">Content Blocked</h2>
      <p className="text-zinc-700 dark:text-zinc-300 mt-2">
        The website at <strong className="break-all">{url}</strong> does not allow being displayed in this panel.
      </p>
      <button
        onClick={handleOpenInNewTab}
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-100 dark:focus:ring-offset-zinc-800 focus:ring-blue-500"
      >
        <ExternalLinkIcon className="w-5 h-5" />
        Open in New Tab
      </button>
    </div>
  );
};

export default BlockedContent;
