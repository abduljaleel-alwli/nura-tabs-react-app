
import React from 'react';
import { LinkCardData } from '../types';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { LinkIcon } from './icons/LinkIcon';

interface LinkCardProps {
  data: LinkCardData;
}

const LinkCard: React.FC<LinkCardProps> = ({ data }) => {
  const { title, description, imageUrl, siteName, url } = data;

  const handleOpenInNewTab = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
        {imageUrl && (
          <div className="w-full h-48 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }}></div>
        )}
        <div className="p-6">
          {siteName && <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{siteName}</p>}
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
          {description && <p className="text-zinc-600 dark:text-zinc-300 mt-2 line-clamp-3">{description}</p>}
          
          <div className="flex items-center gap-2 mt-4 text-xs text-zinc-400 dark:text-zinc-500">
            <LinkIcon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{url}</span>
          </div>

           <button
            onClick={handleOpenInNewTab}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 focus:ring-blue-500"
          >
            <ExternalLinkIcon className="w-5 h-5" />
            Open in New Tab
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkCard;
