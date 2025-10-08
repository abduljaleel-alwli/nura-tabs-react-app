
import React, { useRef, useEffect, useCallback } from 'react';

interface IframeWrapperProps {
  url: string;
  onLoad: () => void;
}

const IframeWrapper: React.FC<IframeWrapperProps> = ({ url, onLoad }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = useCallback(() => {
    onLoad();
  }, [onLoad]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleLoad);
      return () => {
        iframe.removeEventListener('load', handleLoad);
      };
    }
  }, [handleLoad]);


  return (
    <div className="flex-grow relative bg-white">
      <iframe
        ref={iframeRef}
        src={url}
        title="Mini Tab Content"
        className="w-full h-full border-0"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        referrerPolicy="no-referrer"
      ></iframe>
    </div>
  );
};

export default IframeWrapper;
