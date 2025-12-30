
import React, { useState, useEffect } from 'react';
import { Story } from '../types';

interface StoryViewerProps {
  stories: Story[];
  activeId: string;
  onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, activeId, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(stories.findIndex(s => s.id === activeId));
  const [progress, setProgress] = useState(0);
  const currentStory = stories[currentIndex];

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          handleNext();
          return 0;
        }
        return p + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center animate-in fade-in duration-300">
      <div className="relative w-full max-w-[500px] h-full md:h-[90vh] md:rounded-[3rem] overflow-hidden shadow-2xl bg-slate-900">
        <img src={currentStory.mediaUrl} className="w-full h-full object-cover" alt="Story content" />
        
        {/* Progress Bars */}
        <div className="absolute top-0 inset-x-0 p-4 pt-8 flex gap-1.5 z-20">
          {stories.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ width: i === currentIndex ? `${progress}%` : i < currentIndex ? '100%' : '0%' }}
              ></div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-12 inset-x-0 px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <img src={currentStory.userAvatar} className="w-10 h-10 rounded-xl border border-white/20" alt={currentStory.userName} />
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-wide">{currentStory.userName}</h4>
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">2 часа назад</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/20 backdrop-blur-md text-white border border-white/10">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Controls */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 cursor-pointer" onClick={handlePrev}></div>
          <div className="flex-1 cursor-pointer" onClick={handleNext}></div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 inset-x-0 p-8 pt-20 bg-gradient-to-t from-black via-black/40 to-transparent z-20">
          <div className="flex items-center gap-4">
            <input 
              type="text" 
              placeholder="Ответить на историю..." 
              className="flex-1 bg-white/10 backdrop-blur-3xl border border-white/10 rounded-2xl h-14 px-6 text-white text-sm outline-none placeholder:text-white/40 focus:bg-white/20 transition-all"
            />
            <button className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/10 text-white border border-white/10">
              <i className="fas fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
