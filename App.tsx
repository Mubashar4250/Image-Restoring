import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { Button } from './components/Button';
import { BeforeAfter } from './components/BeforeAfter';
import { AppState, ImageFile } from './types';
import { fileToBase64 } from './utils/fileUtils';
import { restoreImage } from './services/geminiService';
import { Upload, Wand2, AlertCircle, ImageIcon } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [sourceImage, setSourceImage] = useState<ImageFile | null>(null);
  const [restoredImageSrc, setRestoredImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Basic validation
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
         setError("Image is too large. Please choose an image under 10MB.");
         return;
      }

      try {
        setError(null);
        const base64Full = await fileToBase64(file);
        // Extract raw base64 and mime type
        const [meta, data] = base64Full.split(',');
        const mimeType = meta.match(/:(.*?);/)?.[1] || 'image/png';
        
        setSourceImage({
          file,
          previewUrl: base64Full,
          base64: data,
          mimeType
        });
        setAppState(AppState.PREVIEW);
      } catch (err) {
        setError("Failed to process image. Please try another one.");
      }
    }
  };

  const handleRestore = async () => {
    if (!sourceImage) return;

    setAppState(AppState.PROCESSING);
    setError(null);

    try {
      // Use the service to call Gemini
      const resultDataUrl = await restoreImage(sourceImage.base64, sourceImage.mimeType);
      setRestoredImageSrc(resultDataUrl);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during restoration. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setSourceImage(null);
    setRestoredImageSrc(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-50 selection:bg-blue-500/30">
      <Header />
      
      <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto flex flex-col items-center min-h-[calc(100vh-6rem)]">
        
        {/* State: IDLE - Landing & Upload */}
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center text-center space-y-8 animate-fade-in mt-10">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full blur opacity-75 animate-pulse"></div>
              <div className="relative bg-slate-800 p-6 rounded-full border border-slate-700">
                <Wand2 size={48} className="text-blue-400" />
              </div>
            </div>
            
            <div className="space-y-4 max-w-lg">
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 tracking-tight">
                AI Photo Enhancer
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Transform old, blurry, and damaged photos into sharp, high-definition DSLR quality images with Google Gemini.
              </p>
            </div>

            <div className="w-full max-w-xs">
               <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-lg py-4"
                icon={<Upload size={20} />}
              >
                Select Photo
              </Button>
              <p className="mt-4 text-xs text-slate-600">
                Supported formats: JPG, PNG, WEBP
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 pt-8">
              {["Ultra Sharp", "Colorize", "Face Enhance", "4K Upscale"].map((feature) => (
                <span key={feature} className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-xs text-slate-400">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* State: PREVIEW or ERROR */}
        {(appState === AppState.PREVIEW || appState === AppState.ERROR || appState === AppState.PROCESSING) && sourceImage && (
          <div className="w-full max-w-md animate-fade-in flex flex-col items-center gap-6">
            
            <div className="relative w-full aspect-[4/5] bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 group">
              <img 
                src={sourceImage.previewUrl} 
                alt="Preview" 
                className="w-full h-full object-contain bg-black/50"
              />
              {appState === AppState.PROCESSING && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-10">
                   <div className="relative mb-4">
                     <div className="w-16 h-16 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                     <SparklesIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 w-6 h-6 animate-pulse" />
                   </div>
                   <h3 className="text-xl font-semibold text-white mb-2">Enhancing & Sharpening...</h3>
                   <p className="text-sm text-slate-300">Applying DSLR quality filters.</p>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-sm font-medium truncate">{sourceImage.file.name}</p>
                <p className="text-slate-400 text-xs">{(sourceImage.file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            {error && (
              <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <div className="flex w-full gap-3">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={resetApp}
                disabled={appState === AppState.PROCESSING}
              >
                Cancel
              </Button>
              <Button 
                className="flex-[2]" 
                onClick={handleRestore}
                isLoading={appState === AppState.PROCESSING}
                icon={<Wand2 size={18} />}
              >
                Enhance Now
              </Button>
            </div>
          </div>
        )}

        {/* State: SUCCESS */}
        {appState === AppState.SUCCESS && sourceImage && restoredImageSrc && (
          <BeforeAfter 
            originalSrc={sourceImage.previewUrl}
            restoredSrc={restoredImageSrc}
            onReset={resetApp}
          />
        )}

      </main>

      <footer className="py-6 text-center text-slate-600 text-xs">
        <p>© {new Date().getFullYear()} Gemini Photo Enhancer. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

export default App;