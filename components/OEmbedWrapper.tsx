
import React, { useEffect, useRef } from 'react';
import { OEmbedData } from '../types';

interface OEmbedWrapperProps {
  data: OEmbedData;
}

const OEmbedWrapper: React.FC<OEmbedWrapperProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // oEmbed content like Twitter widgets rely on scripts.
  // dangerouslySetInnerHTML doesn't run scripts, so we have to manually parse and execute them.
  useEffect(() => {
    if (containerRef.current && data.html) {
      const container = containerRef.current;
      container.innerHTML = data.html; // Set the initial HTML

      // Find all script tags in the inserted HTML
      const scripts = Array.from(container.getElementsByTagName('script'));
      
      // FIX: Add explicit types for 'oldScript' and 'attr' to resolve TypeScript errors
      // where properties were being accessed on type 'unknown'.
      scripts.forEach((oldScript: HTMLScriptElement) => {
        const newScript = document.createElement('script');
        
        // Copy all attributes from the old script to the new one
        Array.from(oldScript.attributes).forEach((attr: Attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // If there's inline script content, copy it
        if (oldScript.innerHTML) {
          newScript.innerHTML = oldScript.innerHTML;
        }

        // Replace the old script tag with the new one to trigger execution
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    }
  }, [data.html]);

  return (
    <div className="flex-grow flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 p-4 sm:p-6 lg:p-8">
      <div 
        ref={containerRef}
        className="oembed-container w-full max-w-2xl [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:shadow-md"
      />
    </div>
  );
};

export default OEmbedWrapper;
