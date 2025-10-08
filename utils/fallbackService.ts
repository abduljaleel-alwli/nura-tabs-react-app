
import { OEmbedData, LinkCardData } from '../types';

// Using a free, open-source CORS proxy.
const CORS_PROXY_URL = 'https://corsproxy.io/?';

interface OEmbedProvider {
  pattern: RegExp;
  endpoint: string;
}

const oEmbedProviders: OEmbedProvider[] = [
  { pattern: /youtube\.com|youtu\.be/, endpoint: 'https://www.youtube.com/oembed' },
  { pattern: /vimeo\.com/, endpoint: 'https://vimeo.com/api/oembed.json' },
  { pattern: /soundcloud\.com/, endpoint: 'https://soundcloud.com/oembed' },
];

export const checkHeadersForBlocking = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(`${CORS_PROXY_URL}${encodeURIComponent(url)}`, { method: 'HEAD' });
    const xFrameOptions = response.headers.get('x-frame-options');
    if (xFrameOptions && (xFrameOptions.toLowerCase() === 'deny' || xFrameOptions.toLowerCase() === 'sameorigin')) {
      return true;
    }
    // Note: Checking for CSP 'frame-ancestors' is more complex as it can be in the body via meta tags,
    // so we rely on X-Frame-Options as a strong initial indicator.
    return false;
  } catch (error) {
    console.error('Header check failed:', error);
    // Fail open: if we can't check headers, assume it's not blocked and let the iframe try.
    return false;
  }
};

export const getOEmbedData = async (url: string): Promise<OEmbedData | null> => {
  const provider = oEmbedProviders.find(p => p.pattern.test(url));
  if (!provider) {
    return null;
  }

  const oembedUrl = `${provider.endpoint}?url=${encodeURIComponent(url)}&format=json&maxwidth=600&maxheight=400`;
  
  // Some oEmbed providers don't have CORS, so we may need a proxy
  const response = await fetch(`${CORS_PROXY_URL}${encodeURIComponent(oembedUrl)}`);
  
  if (!response.ok) {
    throw new Error(`oEmbed request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data as OEmbedData;
};

export const getLinkMetadata = async (url: string): Promise<LinkCardData | null> => {
  const response = await fetch(`${CORS_PROXY_URL}${encodeURIComponent(url)}`);
  if (!response.ok) {
    throw new Error(`Metadata request failed with status ${response.status}`);
  }

  const htmlText = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');

  const getMetaContent = (property: string): string | undefined => {
    return doc.querySelector(`meta[property="${property}"]`)?.getAttribute('content') || undefined;
  };
  
  const title = getMetaContent('og:title') || doc.querySelector('title')?.textContent;
  
  if (!title) {
    // If we can't even find a title, it's not worth showing a card.
    return null;
  }

  return {
    url,
    title,
    description: getMetaContent('og:description'),
    imageUrl: getMetaContent('og:image'),
    siteName: getMetaContent('og:site_name'),
  };
};
