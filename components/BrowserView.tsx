
import React from 'react';
import { InternalTab } from '../types';
import UrlBar from './UrlBar';
import IframeWrapper from './IframeWrapper';

interface BrowserViewProps {
  tab: InternalTab;
  onNavigate: (url: string) => void;
  onStatusChange: (status: { isLoading: boolean; isBlocked: boolean; }) => void;
}

const BrowserView: React.FC<BrowserViewProps> = ({ tab, onNavigate, onStatusChange }) => {
  return (
    <div className="flex flex-col h-full">
      <UrlBar
        key={`urlbar-${tab.id}`}
        initialUrl={tab.url === 'about:blank' ? '' : tab.url}
        onNavigate={onNavigate}
      />
      <IframeWrapper
        key={tab.key}
        url={tab.url}
        isLoading={tab.isLoading}
        isBlocked={tab.isBlocked}
        onStatusChange={onStatusChange}
      />
    </div>
  );
};

export default BrowserView;
