
import React, { useState, useEffect } from 'react';

interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  type: 'mobile' | 'desktop' | 'browser';
  isCurrent: boolean;
}

interface ActiveSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onUpdateCount: (count: number) => void;
}

const ActiveSessionsModal: React.FC<ActiveSessionsModalProps> = ({ isOpen, onClose, onShowToast, onUpdateCount }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isTerminatingAll, setIsTerminatingAll] = useState(false);
  const [closingSessionId, setClosingSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Mock data initialization
      const initialSessions: Session[] = [
        { id: 'curr', device: 'iPhone 15 Pro', location: 'Москва, Россия', ip: '192.168.1.42', lastActive: 'В сети', type: 'mobile', isCurrent: true },
        { id: 's1', device: 'Chrome on Windows', location: 'Берлин, Германия', ip: '104.23.11.90', lastActive: '2 часа назад', type: 'browser', isCurrent: false },
        { id: 's2', device: 'Sapfire Desktop', location: 'Астана, Казахстан', ip: '89.10.123.55', lastActive: 'Вчера, 18:40', type: 'desktop', isCurrent: false },
        { id: 's3', device: 'iPad Air', location: 'Дубай, ОАЭ', ip: '172.16.0.1', lastActive: '3 дня назад', type: 'mobile', isCurrent: false },
      ];
      setSessions(initialSessions);
      onUpdateCount(initialSessions.length);
    }
  }, [isOpen]);

  const handleTerminateAll = () => {
    setIsTerminatingAll(true);
    setTimeout(() => {
      const current = sessions.filter(s => s.isCurrent);
      setSessions(current);
      onUpdateCount(current.length);
      setIsTerminatingAll(false);
      onShowToast('Все остальные сеансы завершены');
    }, 600); // Animation duration
  };

  const handleTerminate = (id: string) => {
    setClosingSessionId(id);
    setTimeout(() => {
      const newSessions = sessions.filter(s => s.id !== id);
      setSessions(newSessions);
      onUpdateCount(newSessions.length);
      setClosingSessionId(null);
      onShowToast('Сеанс завершен');
    }, 300);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'mobile': return 'fa-mobile-screen-button';
      case 'desktop': return 'fa-laptop';
      case 'browser': return 'fa-globe';
      default: return 'fa-device-unknown';
    }
  };

  if (!isOpen) return null;

  const currentSession = sessions.find(s => s.isCurrent);
  const otherSessions = sessions.filter(s => !s.isCurrent);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-lg bg-[#050505] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-8 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)]">
               <i className="fas fa-laptop-code"></i>
             </div>
             <div>
               <h3 className="text-lg font-black text-white uppercase italic tracking-wider">Активные сеансы</h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Управление доступом</p>
             </div>
           </div>
           <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
             <i className="fas fa-times"></i>
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          
          {/* Current Session */}
          {currentSession && (
            <div className="space-y-4">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Текущий сеанс</h4>
               <div className="p-5 rounded-[2rem] bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/20 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)] flex items-center justify-center text-white text-xl shadow-lg shadow-[var(--accent-glow)]">
                    <i className={`fas ${getIcon(currentSession.type)}`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                       <h5 className="text-sm font-black text-white">{currentSession.device}</h5>
                       <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-500 text-[9px] font-black uppercase tracking-wider">Online</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{currentSession.ip} • {currentSession.location}</p>
                  </div>
               </div>
            </div>
          )}

          {/* Other Sessions */}
          {otherSessions.length > 0 && (
            <div className={`space-y-4 transition-all duration-500 ${isTerminatingAll ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100'}`}>
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Другие сеансы</h4>
               <div className="space-y-2">
                 {otherSessions.map(session => (
                   <div 
                     key={session.id} 
                     className={`group p-4 rounded-[1.5rem] bg-white/[0.03] border border-white/5 flex items-center gap-4 hover:bg-white/[0.06] transition-all duration-300 ${closingSessionId === session.id ? 'opacity-0 -translate-x-full h-0 overflow-hidden py-0 margin-0' : ''}`}
                   >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                        <i className={`fas ${getIcon(session.type)}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                         <h5 className="text-sm font-bold text-white truncate">{session.device}</h5>
                         <p className="text-[10px] text-slate-500 font-medium truncate">{session.location} • {session.lastActive}</p>
                      </div>
                      <button 
                        onClick={() => handleTerminate(session.id)}
                        className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        title="Завершить сеанс"
                      >
                         <i className="fas fa-sign-out-alt"></i>
                      </button>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {otherSessions.length === 0 && !isTerminatingAll && (
            <div className="text-center py-8 opacity-50">
              <i className="fas fa-shield-cat text-4xl mb-3 text-slate-600"></i>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Все чисто</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {otherSessions.length > 0 && (
           <div className={`p-6 border-t border-white/5 bg-[#050505] transition-all duration-500 ${isTerminatingAll ? 'opacity-0' : 'opacity-100'}`}>
              <button 
                onClick={handleTerminateAll}
                className="w-full py-4 bg-red-600/10 text-red-500 rounded-2xl font-black uppercase tracking-widest text-xs border border-red-500/20 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <i className="fas fa-power-off"></i>
                Завершить все остальные сеансы
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default ActiveSessionsModal;
