import React, { useRef, useEffect, useCallback } from 'react';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

interface IframeWrapperProps {
  url: string;
  isLoading: boolean;
  isBlocked: boolean;
  onStatusChange: (status: { isLoading: boolean; isBlocked: boolean; }) => void;
}

const IframeWrapper: React.FC<IframeWrapperProps> = ({ url, isLoading, isBlocked, onStatusChange }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleOpenInNewTab = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleLoad = useCallback(() => {
    // The previous method of detecting if content was blocked was flawed, as it
    // would incorrectly flag any cross-origin site due to same-origin policy
    // restrictions on accessing the contentWindow. This change removes that check,
    // allowing the browser to handle embeddable content correctly.
    onStatusChange({ isLoading: false, isBlocked: false });
  }, [onStatusChange]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleLoad);
      return () => {
        iframe.removeEventListener('load', handleLoad);
      };
    }
  }, [handleLoad]);

  if (url === 'about:blank') {
    return (
      <div className="flex-grow flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <p className="text-zinc-500 dark:text-zinc-500">Enter a URL to start browsing</p>
      </div>
    );
  }

  return (
    <div className="flex-grow relative bg-zinc-50 dark:bg-zinc-900">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-50/80 dark:bg-zinc-900/80 z-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {isBlocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 p-4 z-10 text-center">
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
      )}
      <iframe
        ref={iframeRef}
        src={url}
        title="Nura Tab Content"
        className={`w-full h-full border-0 ${isBlocked || isLoading ? 'opacity-0' : 'opacity-100'}`}
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        referrerPolicy="no-referrer"
      ></iframe>
    </div>
  );
};

export default IframeWrapper;