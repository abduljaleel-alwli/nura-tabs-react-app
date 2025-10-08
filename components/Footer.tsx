import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="text-center py-8 mt-8 border-t border-zinc-200 dark:border-zinc-800">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Copyright © {currentYear}{' '}
        <a
          href="https://shamlltech.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          Shamll tech
        </a>
        . All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
