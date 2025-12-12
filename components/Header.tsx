import React from 'react';
import { Camera, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-500 to-violet-600 p-2 rounded-lg">
            <Camera size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Gemini AI Enhancer</h1>
            <p className="text-xs text-slate-400">Restore & Sharpen</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
          <Sparkles size={12} />
          <span>PRO Quality</span>
        </div>
      </div>
    </header>
  );
};