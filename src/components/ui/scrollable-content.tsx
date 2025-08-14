import React from 'react';
import { cn } from '@/lib/utils';

interface ScrollableContentProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
  showScrollbar?: boolean;
}

const ScrollableContent: React.FC<ScrollableContentProps> = ({
  children,
  className,
  maxHeight = '90vh',
  showScrollbar = true
}) => {
  return (
    <div
      className={cn(
        'overflow-y-auto',
        {
          'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800': showScrollbar,
          'scrollbar-hide': !showScrollbar
        },
        className
      )}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
};

export default ScrollableContent;
