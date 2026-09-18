import React from 'react';

export const LoadingSkeleton: React.FC<{ type?: 'card' | 'details' | 'timeline' | 'table' }> = ({ type = 'card' }) => {
  if (type === 'details') {
    return (
      <div className="space-y-4 animate-pulse p-4 bg-slate-900/60 rounded-xl border border-slate-800">
        <div className="h-6 bg-slate-800 rounded-md w-3/4" />
        <div className="h-4 bg-slate-800/60 rounded-md w-1/2" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="h-16 bg-slate-800/40 rounded-lg" />
          <div className="h-16 bg-slate-800/40 rounded-lg" />
        </div>
        <div className="h-24 bg-slate-800/30 rounded-lg w-full" />
      </div>
    );
  }

  if (type === 'timeline') {
    return (
      <div className="space-y-3 animate-pulse p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-800/60 rounded w-1/3" />
              <div className="h-3 bg-slate-800/40 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse space-y-3">
      <div className="h-5 bg-slate-800 rounded w-2/3" />
      <div className="h-4 bg-slate-800/60 rounded w-1/2" />
    </div>
  );
};
