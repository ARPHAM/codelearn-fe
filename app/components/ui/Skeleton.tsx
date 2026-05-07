import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width, 
  height, 
  borderRadius = 8, 
  className = '', 
  style 
}) => {
  return (
    <div 
      className={`skeleton-pulse ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        ...style
      }}
    />
  );
};
