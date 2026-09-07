import React from "react";

export const LibertyIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 -25 100 115"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g fill="#007DA5">
      <path d="M 50,85 A 30,30 0 1,0 50,25 A 30,30 0 1,0 50,85 Z M 50,75 A 20,20 0 1,1 50,35 A 20,20 0 1,1 50,75 Z" />
      <g transform="rotate(-25 50 55)">
        <path d="M 25.5,30 L 5,10 L 28,15 L 25,-10 L 42,10 L 50,-20 L 58,10 L 75,-10 L 72,15 L 95,10 L 74.5,30 A 35,35 0 0,0 25.5,30 Z" />
      </g>
    </g>
  </svg>
);

export const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
  </svg>
);
