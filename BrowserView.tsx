
import React, { useState, useEffect } from 'react';
import { InternalTab, OEmbedData, LinkCardData } from '../types';
import UrlBar from './UrlBar';
import IframeWrapper from './IframeWrapper';
import OEmbedWrapper from './OEmbedWrapper';
import LinkCard from './LinkCard';
import BlockedContent from './BlockedContent';
import { getOEmbedData, getLinkMetadata, checkHeadersForBlocking } from '../utils/fallbackService';

interface BrowserViewProps {
  tab: InternalTab;
  onNavigate: (url: string) => void;
  onStatusChange: (status: { isLoading: boolean; isBlocked: boolean; }) => void;
}

type ViewState = 'initial' | 'loading' | 'iframe' | 'oembed' | 'link-card' | 'blocked';

const BrowserView: React.FC<BrowserViewProps> = ({ tab, onNavigate, onStatusChange }) => {
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

      // 1. Prioritize oEmbed for a better UX on supported sites like YouTube.
      try {
        const oembed = await getOEmbedData(tab.url);
        if (oembed && oembed.html) {
          setFallbackData(oembed);
          setViewState('oembed');
          // Mark as "blocked" from an iframe perspective so it's saved correctly
          onStatusChange({ isLoading: false, isBlocked: true });
          return;
        }
      } catch (error) {
        console.warn('oEmbed check failed:', error);
      }

      // 2. If no oEmbed, check if the site can be iframed by checking headers.
      try {
        const isBlockedByHeaders = await checkHeadersForBlocking(tab.url);
        if (isBlockedByHeaders) {
          // 3a. If blocked, try to get link card metadata as a fallback.
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
          
          // 3b. If metadata fails, show the generic blocked content page.
          setViewState('blocked');
          onStatusChange({ isLoading: false, isBlocked: true });

        } else {
          // 4. If not blocked by headers, it's safe to attempt loading the iframe.
          setViewState('iframe');
          // IframeWrapper will call onStatusChange with isLoading: false, isBlocked: false
        }
      } catch (error) {
        // If the header check itself fails, attempt iframe as a last resort.
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
    <div className="flex flex-col h-full">
      <UrlBar
        key={`urlbar-${tab.id}`}
        initialUrl={tab.url === 'about:blank' ? '' : tab.url}
        onNavigate={onNavigate}
      />
      {renderContent()}
    </div>
  );
};

export default BrowserView;
