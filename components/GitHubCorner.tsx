// components/GitHubCorner.tsx
import React from "react";

export default function GitHubCorner({
  href = "https://github.com/dariansweb/secure-nextjs-lesson",
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  // Pure SVG (no external CSS/JS). Inspired by Tim Holman’s GitHub Corners.
  return (
    <a
      href={href}
      aria-label="View source on GitHub"
      className={`fixed right-0 top-0 z-50 ${className}`}
    >
      <svg
        width="70"
        height="70"
        viewBox="0 0 250 250"
        aria-hidden="true"
        className="drop-shadow-sm"
      >
        {/* corner background */}
        <path
          d="M0,0 L115,0 L250,135 L250,250 L0,250 Z"
          className="fill-slate-900 dark:fill-slate-200"
        />
        {/* Octocat arm */}
        <path
          className="origin-[130px_106px] fill-white/90"
          d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6
             C122.0,82.7 120.5,78.6 120.5,78.6
             C119.2,72.0 123.4,76.3 123.4,76.3
             C127.3,80.9 125.5,87.3 125.5,87.3
             C122.9,97.6 130.6,101.9 134.4,103.2"
        />
        {/* Octocat body */}
        <path
          className="fill-white/90"
          d="M115.0,115.0 C114.9,115.1 114.9,115.3 115.0,115.5
             C114.9,115.3 114.9,115.1 115.0,115.0
             M135.0,107.0 C134.7,108.4 133.9,109.6 132.7,110.5
             C141.0,110.1 146.0,105.0 146.0,105.0
             C145.0,114.0 139.0,118.0 135.0,119.0
             M122.0,120.0 C122.0,120.0 119.0,121.0 115.0,120.0
             C109.0,118.0 100.0,112.0 100.0,98.0
             C100.0,82.0 112.0,72.0 125.0,72.0
             C138.0,72.0 150.0,82.0 150.0,98.0
             C150.0,112.0 141.0,118.0 135.0,120.0
             C131.0,121.0 128.0,120.0 128.0,120.0 Z"
        />
      </svg>
      <span className="sr-only">View source on GitHub</span>
    </a>
  );
}
