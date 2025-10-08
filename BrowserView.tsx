import React, { useState, useEffect } from 'react';
import { InternalTab, OEmbedData, LinkCardData } from './types';
import UrlBar from './UrlBar';
import IframeWrapper from './IframeWrapper';
import OEmbedWrapper from './components/OEmbedWrapper';
import LinkCard from './components/LinkCard';
import BlockedContent from './components/BlockedContent';
import { getOEmbedData, getLinkMetadata, checkHeadersForBlocking } from './utils/fallbackService';
import { ShrinkIcon } from './components/icons/ShrinkIcon';

interface BrowserViewProps {
  tab: InternalTab;
  onNavigate: (url: string) => void;
  onStatusChange: (status: { isLoading: boolean; isBlocked: boolean; }) => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

type ViewState = 'initial' | 'loading' | 'iframe' | 'oembed' | 'link-card' | 'blocked';

const BrowserView: React.FC<BrowserViewProps> = ({ tab, onNavigate, onStatusChange, isFullScreen, onToggleFullScreen }) => {
  const [viewState, setViewState] = useState<ViewState>('initial');
  const [fallbackData, setFallbackData] = useState<OEmbedData | LinkCardData | null>(null);

  useEffect(() => {
    const processUrl = async () => {
      if (!tab.url || tab.url === 'about:blank') {
        setViewState('initial');
        return;
      }

      setViewState('loading');
      setFallbackData(null);

      try {
        const oembed = await getOEmbedData(tab.url);
        if (oembed && oembed.html) {
          setFallbackData(oembed);
          setViewState('oembed');
          onStatusChange({ isLoading: false, isBlocked: true });
          return;
        }
      } catch (error) {
        console.warn('oEmbed check failed:', error);
      }

      try {
        const isBlockedByHeaders = await checkHeadersForBlocking(tab.url);
        if (isBlockedByHeaders) {
          try {
            const metadata = await getLinkMetadata(tab.url);
            if (metadata && metadata.title) {
              setFallbackData(metadata);
              setViewState('link-card');
              onStatusChange({ isLoading: false, isBlocked: true });
              return;
            }
          } catch (error) {
            console.warn('Metadata fetch failed:', error);
          }
          
          setViewState('blocked');
          onStatusChange({ isLoading: false, isBlocked: true });

        } else {
          setViewState('iframe');
        }
      } catch (error) {
        console.warn('Header check failed, attempting iframe load directly:', error);
        setViewState('iframe');
      }
    };

    processUrl();
  }, [tab.url, tab.key, onStatusChange]);

  const renderContent = () => {
    switch (viewState) {
      case 'loading':
        return (
          <div className="flex-grow flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      case 'oembed':
        return <OEmbedWrapper data={fallbackData as OEmbedData} />;
      case 'link-card':
        return <LinkCard data={fallbackData as LinkCardData} />;
      case 'blocked':
        return <BlockedContent url={tab.url} />;
      case 'iframe':
         return (
            <IframeWrapper
                key={tab.key}
                url={tab.url}
                onLoad={() => onStatusChange({ isLoading: false, isBlocked: false })}
            />
        );
      case 'initial':
      default:
        return (
            <div className="flex-grow flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                <p className="text-zinc-500 dark:text-zinc-500">Enter a URL to start browsing</p>
            </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-900 relative">
      {!isFullScreen && (
        <UrlBar
            key={`urlbar-${tab.id}`}
            initialUrl={tab.url === 'about:blank' ? '' : tab.url}
            onNavigate={onNavigate}
            onToggleFullScreen={onToggleFullScreen}
        />
      )}
      {isFullScreen && (
          <button
            onClick={onToggleFullScreen}
            className="fixed top-4 right-4 z-[100] p-2 bg-black/50 text-white rounded-full hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
            aria-label="Exit full screen"
          >
              <ShrinkIcon className="w-5 h-5" />
          </button>
      )}
      {renderContent()}
    </div>
  );
};

export default BrowserView;