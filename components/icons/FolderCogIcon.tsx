import React from 'react';

export const FolderCogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z"></path>
    <circle cx="12" cy="13" r="1"></circle>
    <path d="M12 10v1"></path>
    <path d="M12 15v1"></path>
    <path d="M14.5 11.5l.8.8"></path>
    <path d="M9.8 14.3l.7.7"></path>
    <path d="M14.5 14.5l.8-.8"></path>
    <path d="M9.8 11.7l.7-.7"></path>
  </svg>
);
