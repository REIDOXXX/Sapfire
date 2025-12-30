
import React from 'react';

const CallsView: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto p-6 md:p-12 custom-scrollbar animate-in fade-in">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="flex justify-between items-center px-4">
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Журнал связи</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Шифрование сквозное (AES-256)</p>
          </div>
          <button className="w-12 h-12 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-lg shadow-[var(--accent-glow)]">
            <i className="fas fa-phone-plus"></i>
          </button>
        </header>

        <div className="space-y-3">
          {[
            { name: 'Александр', type: 'video', status: 'missed', time: '14:20', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex' },
            { name: 'Мария', type: 'audio', status: 'incoming', time: 'Вчера, 18:05', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria' },
            { name: 'PixelQueen', type: 'video', status: 'outgoing', time: '12 Июня', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pixel' },
            { name: 'Admin', type: 'audio', status: 'missed', time: '11 Июня', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin' },
          ].map((call, i) => (
            <div key={i} className="flex items-center gap-4 p-5 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group">
              <div className="relative">
                <img src={call.avatar} className="w-14 h-14 rounded-2xl border border-white/5" alt={call.name} />
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-[10px] ${call.status === 'missed' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                  <i className={`fas ${call.status === 'missed' ? 'fa-arrow-down-left' : call.status === 'outgoing' ? 'fa-arrow-up-right' : 'fa-arrow-down-left'}`}></i>
                </div>
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-black uppercase tracking-wide ${call.status === 'missed' ? 'text-red-400' : 'text-white'}`}>{call.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <i className={`fas ${call.type === 'video' ? 'fa-video' : 'fa-phone'} text-[10px] text-slate-600`}></i>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{call.time}</span>
                </div>
              </div>
              <button className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                <i className="fas fa-info-circle"></i>
              </button>
            </div>
          ))}
        </div>

        <div className="p-8 rounded-[3rem] bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-2xl text-[var(--accent-primary)]">
            <i className="fas fa-lock"></i>
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Безопасная сеть</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs">Ваши вызовы проходят через распределенную сеть узлов Sapfire для максимальной анонимности.</p>
        </div>
      </div>
    </div>
  );
};

export default CallsView;
