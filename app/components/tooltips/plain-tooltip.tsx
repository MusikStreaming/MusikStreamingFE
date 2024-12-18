'use client';

import { useState } from 'react';

export default function PlainTooltip({
  children,
  content,
}: {
  children: React.ReactNode;
  content: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onMouseMove={handleMouseMove}
    >
      {children}
      {isVisible && (
        <div 
          className="fixed px-2 py-1 bg-[--md-sys-color-inverse-surface] rounded text-sm text-[--md-sys-color-inverse-on-surface] whitespace-nowrap z-[100] translate-x-[-50%]"
          style={{
            left: `${position.x}px`,
            top: `${position.y - 30}px`, // Offset above cursor
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}