import React, { useState } from 'react';
import { GlobeIcon } from './icons/GlobeIcon';

interface FaviconProps {
  url: string;
  className?: string;
}

const Favicon: React.FC<FaviconProps> = ({ url, className }) => {
  const [error, setError] = useState(false);

  let faviconUrl = '';
  let showFallback = error;

  try {
    const hostname = new URL(url).hostname;
    if (hostname) {
        faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    } else {
        showFallback = true;
    }
  } catch (e) {
    showFallback = true;
  }
  
  if (showFallback || !url || url === 'about:blank') {
    return <GlobeIcon className={className} />;
  }

  return (
    <img
      src={faviconUrl}
      alt="favicon"
      className={className}
      onError={() => setError(true)}
      width="16"
      height="16"
    />
  );
};

export default Favicon;
