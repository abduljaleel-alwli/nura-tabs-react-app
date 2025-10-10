import React, { useState } from "react";
import { CopyIcon } from "./icons/CopyIcon";
import { CheckIcon } from "./icons/CheckIcon";

interface UrlBarProps {
  initialUrl: string;
  onNavigate: (url: string) => void;
}

const UrlBar: React.FC<UrlBarProps> = ({ initialUrl, onNavigate }) => {
  const [url, setUrl] = useState(initialUrl);
  const [isCopied, setIsCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate(url);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    // Regex to find a URL within a string. It looks for http(s) protocols, www domains, or common TLDs.
    const urlRegex =
      /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(?:com|org|net|gov|edu|io|co|ai|dev|app|tech)[^\s]*)/i;
    const match = pastedText.match(urlRegex);

    if (match) {
      e.preventDefault();
      const extractedUrl = match[0];
      setUrl(extractedUrl);
    }
  };

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      // Fallback: ask the parent frame to handle the copy action
      try {
        window.parent?.postMessage(
          { type: "NOUR_COPY_REQUEST", payload: url },
          "*"
        );
        // Optional: show a toast like "Copying via parent frame..."
      } catch (e) {
        console.error("Clipboard blocked and postMessage failed:", e);
      }
    }
  };

  return (
    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onPaste={handlePaste}
          placeholder="Enter URL and press Enter"
          className="w-full pl-3 pr-10 py-2 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-md border border-zinc-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          autoFocus
          onFocus={(e) => e.target.select()}
        />
        <button
          type="button"
          onClick={handleCopy}
          disabled={!url}
          className="absolute right-2 p-1 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label={isCopied ? "URL Copied" : "Copy URL"}
        >
          {isCopied ? (
            <CheckIcon className="w-5 h-5 text-green-500 dark:text-green-400" />
          ) : (
            <CopyIcon className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default UrlBar;
