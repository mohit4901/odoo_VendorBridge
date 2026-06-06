import React from 'react';
import Card from '../components/Card';
import { RefreshCw } from 'lucide-react';

const ComingSoon = ({ moduleName, chunkDescription }) => {
  return (
    <div className="h-full flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-cyan-950/40 border border-cyan-900/60 text-cyan-400 glow-cyan">
          <RefreshCw className="w-5 h-5 animate-spin" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white tracking-wide">
            Module: {moduleName}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
            This module is scheduled for implementation in the next phase ({chunkDescription}). Core scaffolding is ready.
          </p>
        </div>
        
        {/* Loading skeleton wrapper */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4 text-left">
          <div className="h-4.5 bg-zinc-900 rounded-md w-1/3 animate-pulse"></div>
          <div className="space-y-2.5">
            <div className="h-3.5 bg-zinc-900/60 rounded-md w-full animate-pulse"></div>
            <div className="h-3.5 bg-zinc-900/60 rounded-md w-5/6 animate-pulse"></div>
            <div className="h-3.5 bg-zinc-900/60 rounded-md w-2/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
