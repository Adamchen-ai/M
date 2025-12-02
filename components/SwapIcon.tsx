
import React from 'react';

export const SwapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 16V4m0 12l-4-4m4 4l4-4m6 8v-12m0 12l-4-4m4 4l4-4"
    />
  </svg>
);
