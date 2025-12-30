
import React, { useState } from 'react';
import { Contact, ViewType } from '../types';
import { useSettings } from '../context/SettingsContext';

interface HeaderProps {
  activeContact: Contact;
  currentView: ViewType;
  onBack: () => void;
  onOpenProfile: (id: string) => void;
  isDetailMode: boolean;
  onCallClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeContact, currentView, onBack, onOpenProfile, isDetailMode, onCallClick }) => {
  const { t } = useSettings();
  const [showMoodPopup, setShowMoodPopup] = useState(false);
  
  const getTitle = () => {
    switch(currentView) {
      case ViewType.CHAT: return activeContact.name;
      case ViewType.WALLET: return 'SAPFIRE WALLET';
      case ViewType.CALLS: return 'RECENT CALLS';
      case ViewType.LIVE: return 'SAPFIRE LIVE';
      case ViewType.SETTINGS: return 'CORE SETTINGS';
      default: return 'SAPFIRE';
    }
  };

  const isDirectChat = activeContact.type === 'direct';

  return (
    <header className="h-20 md:h-24 flex items-center justify-between px-6 md:px-10 border-b border-white/5 bg-black/10 backdrop-blur-md z-40 sticky top-0 shrink-0">
      <div className="flex items-center gap-4">
        {isDetailMode && (
          <button onClick={onBack} className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white">
            <i className="fas fa-chevron-left"></i>
          </button>
        )}
        
        {currentView === ViewType.CHAT ? (
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer group" onClick={() => onOpenProfile(activeContact.id)}>
              <img 
                src={activeContact.avatar} 
                className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border border-white/10 group-hover:border-[var(--accent-primary)] transition-all object-cover" 
                style={activeContact.mood ? { boxShadow: `0 0 15px ${activeContact.mood.color}66` } : {}}
                alt={activeContact.name} 
              />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-black rounded-full flex items-center justify-center overflow-hidden ${activeContact.status === 'online' ? 'bg-green-500' : 'bg-slate-600'}`}>
                {activeContact.mood && <span className="text-[10px]">{activeContact.mood.emoji}</span>}
              </div>
            </div>
            <div className="cursor-pointer relative" onClick={() => activeContact.mood && setShowMoodPopup(!showMoodPopup)}>
              <h1 className="text-sm md:text-base font-black text-white uppercase tracking-wider">{activeContact.name}</h1>
              <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${activeContact.status === 'online' ? 'bg-green-500' : 'bg-slate-600'}`}></span>
                {activeContact.status === 'online' ? t('Online') : t('Offline')}
                {activeContact.mood && (
                  <>
                    <span className="opacity-30">•</span>
                    <span className="text-[var(--accent-primary)] animate-in fade-in slide-in-from-left-2">{activeContact.mood.emoji} {activeContact.mood.text}</span>
                  </>
                )}
              </p>

              {/* Mood Popover */}
              {showMoodPopup && activeContact.mood && (
                <div className="absolute top-12 left-0 z-50 w-64 glass p-6 rounded-[2rem] border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="text-5xl drop-shadow-[0_0_15px_rgba(251,191,36,0.3)] animate-bounce">
                      {activeContact.mood.emoji}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-1">{activeContact.mood.text}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Статус {activeContact.name}</p>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full animate-pulse" style={{ backgroundColor: activeContact.mood.color, width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 flex items-center justify-center">
                <i className={`fas ${getViewIcon(currentView)} text-[var(--accent-primary)] text-lg`}></i>
             </div>
             <h1 className="text-sm md:text-lg font-black text-white uppercase tracking-widest italic">{getTitle()}</h1>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {currentView === ViewType.CHAT && isDirectChat && (
          <>
            <button onClick={onCallClick} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 transition-all">
              <i className="fas fa-phone"></i>
            </button>
            <button onClick={onCallClick} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 transition-all">
              <i className="fas fa-video"></i>
            </button>
          </>
        )}
        <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all">
          <i className="fas fa-ellipsis-v"></i>
        </button>
      </div>
      
      {/* Click outside closer for popover */}
      {showMoodPopup && <div className="fixed inset-0 z-40" onClick={() => setShowMoodPopup(false)}></div>}
    </header>
  );
};

const getViewIcon = (view: ViewType) => {
  switch(view) {
    case ViewType.WALLET: return 'fa-wallet';
    case ViewType.CALLS: return 'fa-phone';
    case ViewType.LIVE: return 'fa-tower-broadcast';
    case ViewType.SETTINGS: return 'fa-cog';
    default: return 'fa-bolt';
  }
};

export default Header;
