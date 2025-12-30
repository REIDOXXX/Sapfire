
import React from 'react';
import { Contact, AppUser } from '../types';

interface ProfileViewProps {
  profileUser: Contact | AppUser;
  isMe: boolean;
  onClose: () => void;
  user?: AppUser;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profileUser, isMe, onClose, user }) => {
  const hasGoldenFrame = isMe && user?.activeFrame === 'frame_gold';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-[#08080a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-full">
        <div className="h-48 md:h-64 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/40 to-[var(--accent-secondary)]/40"></div>
          <img src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover opacity-30 mix-blend-overlay" alt="Banner" />
          <button onClick={onClose} className="absolute top-6 right-6 w-12 h-12 bg-black/40 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="px-8 md:px-12 pb-12 -mt-20 relative flex-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="relative flex-shrink-0">
                <div className={`p-1 rounded-[3rem] transition-all duration-500 ${hasGoldenFrame ? 'bg-gradient-to-br from-yellow-300 via-yellow-600 to-yellow-300 shadow-[0_0_25px_rgba(251,191,36,0.6)]' : ''}`}>
                  <img src={profileUser.avatar} className={`w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-4 border-[#08080a] shadow-2xl object-cover ${hasGoldenFrame ? 'border-transparent' : ''}`} alt={profileUser.name} />
                </div>
                <div className="absolute bottom-4 right-4 w-8 h-8 bg-green-500 border-4 border-[#08080a] rounded-full"></div>
              </div>
              <div className="flex-1 space-y-2 pb-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase">{profileUser.name}</h2>
                  {(isMe ? user?.inventory?.includes('badge_verified') : (profileUser as Contact).isVerified) && <i className="fas fa-check-circle text-[var(--accent-primary)] text-xl"></i>}
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">@{profileUser.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Друзей', value: '1.2k' },
                { label: 'Записей', value: '452' },
                { label: 'Уровень', value: isMe ? user?.level : '24' }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-3xl text-center">
                  <h4 className="text-xl font-black text-white italic">{stat.value}</h4>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">О себе</h4>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                {profileUser.bio || 'Этот пользователь предпочитает сохранять загадочность.'}
              </p>
            </div>

            <div className="space-y-4">
               <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Медиа</h4>
               <div className="grid grid-cols-3 gap-3">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="aspect-square rounded-2xl bg-white/5 overflow-hidden border border-white/5 group cursor-pointer">
                       <img src={`https://picsum.photos/seed/${i + 10}/300/300`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all scale-110 group-hover:scale-100" alt="Media" />
                    </div>
                  ))}
               </div>
            </div>

            <div className="flex gap-4 pt-4 sticky bottom-0 bg-[#08080a] py-4 border-t border-white/5">
              {isMe ? (
                <button className="flex-1 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[var(--accent-primary)] hover:text-white transition-all shadow-xl">Редактировать профиль</button>
              ) : (
                <>
                  <button className="flex-1 py-4 bg-[var(--accent-primary)] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[var(--accent-glow)]">Сообщение</button>
                  <button className="w-16 h-14 flex items-center justify-center bg-white/5 border border-white/5 text-white rounded-2xl hover:bg-white/10 transition-all">
                    <i className="fas fa-user-plus"></i>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
