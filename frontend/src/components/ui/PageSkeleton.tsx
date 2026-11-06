import React from 'react';

/** Route-level loading placeholder shaped like a typical page: header, stat row, content cards. */
export const PageSkeleton: React.FC = () => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading page">
    <div className="space-y-2">
      <div className="skeleton h-4 w-32" />
      <div className="skeleton h-8 w-72 max-w-full" />
      <div className="skeleton h-4 w-96 max-w-full" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="skeleton h-20" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="skeleton h-40" />
      ))}
    </div>
  </div>
);
