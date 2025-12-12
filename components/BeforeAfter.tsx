import React, { useState, useRef, useEffect } from 'react';
import { Download, RefreshCw, X } from 'lucide-react';
import { Button } from './Button';
import { downloadImage } from '../utils/fileUtils';

interface BeforeAfterProps {
  originalSrc: string;
  restoredSrc: string;
  onReset: () => void;
}

export const BeforeAfter: React.FC<BeforeAfterProps> = ({ originalSrc, restoredSrc, onReset }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = () => { isDragging.current = true; };
  const handleMouseUp = () => { isDragging.current = false; };
  
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  // Add global mouse up listener
  useEffect(() => {
    const stopDragging = () => { isDragging.current = false; };
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchend', stopDragging);
    return () => {
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchend', stopDragging);
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto animate-fade-in">
      
      {/* Viewer */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-[3/4] sm:aspect-square md:aspect-[4/3] bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 select-none touch-none"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* Restored Image (Background) */}
        <img 
          src={restoredSrc} 
          alt="Restored" 
          className="absolute inset-0 w-full h-full object-contain bg-black/50"
          draggable={false}
        />

        {/* Original Image (Foreground - Clipped) */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img 
            src={originalSrc} 
            alt="Original" 
            className="absolute top-0 left-0 max-w-none h-full w-[100cqw] object-contain bg-black/50" // 100cqw requires container queries, fallback via JS logic usually better but let's try object-contain overlay technique
            style={{ 
              width: containerRef.current ? containerRef.current.clientWidth : '100%'
              // We need the inner image to match the outer image size exactly to align them. 
              // `object-contain` makes this tricky if aspect ratios differ from container.
              // For simplicity in this demo, we assume the images have same aspect ratio.
             }}
            draggable={false}
          />
          {/* Label */}
          <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded font-medium backdrop-blur-sm border border-white/10">
            Original
          </div>
        </div>
        
        {/* Label for Restored (Right side) */}
        <div className="absolute top-4 right-4 bg-blue-600/80 text-white text-xs px-2 py-1 rounded font-medium backdrop-blur-sm border border-white/10">
          Restored
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-900">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8L22 12L18 16" />
              <path d="M6 8L2 12L6 16" />
            </svg>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="secondary" 
          onClick={onReset}
          icon={<RefreshCw size={18} />}
        >
          New Photo
        </Button>
        <Button 
          onClick={() => downloadImage(restoredSrc, `restored-${Date.now()}.png`)}
          icon={<Download size={18} />}
        >
          Download
        </Button>
      </div>
      
      <p className="text-center text-slate-500 text-sm">
        Use the slider to compare the before and after results.
      </p>
    </div>
  );
};