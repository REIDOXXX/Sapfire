
import React, { useState } from 'react';
import { ViewType, Contact, Story, AppUser, ContactType } from '../types';
import { useSettings } from '../context/SettingsContext';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  contacts: Contact[];
  stories: Story[];
  onStoryClick: (id: string) => void;
  activeContactId: string;
  onContactSelect: (id: string) => void;
  user: AppUser;
  onMyProfile: () => void;
  onOpenCreateCommunity: (type: ContactType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  contacts,
  stories,
  onStoryClick,
  activeContactId,
  onContactSelect,
  user,
  onMyProfile,
  onOpenCreateCommunity
}) => {
  const { t } = useSettings();
  const [activeTab, setActiveTab] = useState<'all' | 'direct' | 'groups'>('all');
  const [showFabMenu, setShowFabMenu] = useState(false);
  const hasGoldenFrame = user.activeFrame === 'frame_gold';

  const filteredContacts = contacts.filter(c => {
    if (activeTab === 'all') return true;
    if (activeTab === 'direct') return c.type === 'direct';
    if (activeTab === 'groups') return c.type === 'group' || c.type === 'channel';
    return true;
  });

  return (
    <div className="flex flex-col h-full w-full bg-black/40 backdrop-blur-3xl relative">
      {/* Header */}
      <div className="p-8 pb-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 cursor-pointer group shrink-0" onClick={onMyProfile}>
            <div className="relative shrink-0">
              <div className={`p-0.5 rounded-[1.35rem] transition-all duration-500 ${hasGoldenFrame ? 'bg-gradient-to-br from-yellow-300 via-yellow-600 to-yellow-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : ''}`}>
                <img 
                  src={user.avatar} 
                  className={`w-12 h-12 rounded-[1.25rem] border border-white/10 group-hover:border-[var(--accent-primary)] transition-all object-cover shrink-0 aspect-square ${hasGoldenFrame ? 'border-transparent' : ''}`} 
                  style={user.mood ? { boxShadow: `0 0 15px ${user.mood.color}66` } : {}}
                  alt="Me" 
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full flex items-center justify-center overflow-hidden shrink-0">
                {user.mood && <span className="text-[8px] shrink-0">{user.mood.emoji}</span>}
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-white uppercase tracking-wider truncate">{user.name}</h3>
                {user.inventory?.includes('badge_verified') && <i className="fas fa-check-circle text-blue-500 text-[10px]"></i>}
              </div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate">
                {user.mood ? `${user.mood.emoji} ${user.mood.text}` : `Lvl ${user.level}`}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowFabMenu(!showFabMenu)}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 z-10 ${showFabMenu ? 'bg-[var(--accent-primary)] text-white rotate-45' : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'}`}
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-2xl mb-6">
          <button 
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
          >
            Все
          </button>
          <button 
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'direct' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
          >
            Личные
          </button>
          <button 
            onClick={() => setActiveTab('groups')}
            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'groups' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
          >
            Группы
          </button>
        </div>

        <div className="relative group">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[var(--accent-primary)] transition-colors shrink-0"></i>
          <input 
            type="text" 
            placeholder={t('Search')} 
            className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 text-xs text-white placeholder:text-slate-700 focus:border-white/20 transition-all outline-none" 
          />
        </div>
      </div>

      {/* Stories */}
      <div className="px-8 mb-8">
        <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-16 h-16 rounded-[1.5rem] border-2 border-dashed border-white/10 flex items-center justify-center group-hover:border-[var(--accent-primary)] transition-all shrink-0 aspect-square">
              <i className="fas fa-plus text-slate-500"></i>
            </div>
            <span className="text-[8px] font-black uppercase text-slate-500">Add</span>
          </div>
          {stories.map(story => (
            <div 
              key={story.id} 
              className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer"
              onClick={() => onStoryClick(story.id)}
            >
              <div className={`w-16 h-16 rounded-[1.5rem] p-0.5 border-2 ${story.viewed ? 'border-white/10' : 'border-[var(--accent-primary)]'} active-glow transition-all hover:scale-105 shrink-0 aspect-square`}>
                <img src={story.userAvatar} className="w-full h-full rounded-[1.25rem] object-cover shrink-0 aspect-square" alt={story.userName} />
              </div>
              <span className="text-[8px] font-black uppercase text-slate-300 truncate w-16 text-center">{story.userName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contacts */}
      <div className="flex-1 overflow-y-auto px-6 custom-scrollbar pb-32">
        <h4 className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4 shrink-0">Latest Pulses</h4>
        <div className="space-y-2">
          {filteredContacts.map((contact, idx) => (
            <button 
              key={`${contact.id}-${idx}`} 
              onClick={() => onContactSelect(contact.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-[2rem] transition-all group ${activeContactId === contact.id && currentView === ViewType.CHAT ? 'bg-white/10 border border-white/10 shadow-xl' : 'hover:bg-white/[0.03]'}`}
            >
              <div className="relative flex-shrink-0">
                <div className={`w-14 h-14 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden bg-white/5 transition-all group-hover:scale-105 shrink-0`}>
                  {contact.type === 'direct' ? (
                    <img src={contact.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(contact.name)}`} className="w-full h-full object-cover" alt={contact.name} />
                  ) : contact.type === 'channel' ? (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-white text-xl">
                      <i className="fas fa-bullhorn"></i>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-xl">
                      <i className="fas fa-users"></i>
                    </div>
                  )}
                </div>
                {contact.type === 'direct' && (
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-2 border-black rounded-full flex items-center justify-center overflow-hidden shrink-0 aspect-square ${contact.status === 'online' ? 'bg-green-500' : 'bg-slate-700'}`}>
                    {contact.mood && <span className="text-[10px] shrink-0">{contact.mood.emoji}</span>}
                  </div>
                )}
                {contact.type === 'channel' && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white border-2 border-black">
                    <i className="fas fa-check"></i>
                  </div>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="text-xs font-black uppercase tracking-wide truncate text-white flex items-center gap-2">
                    {contact.type === 'channel' && <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase mr-1">КАНАЛ</span>}
                    {contact.type === 'group' && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase mr-1">ГРУППА</span>}
                    {contact.name}
                  </h4>
                  <span className="text-[8px] font-bold text-slate-600 shrink-0">Now</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate font-medium">
                  {contact.type === 'channel' ? (
                    <span className="text-blue-400 font-bold uppercase tracking-tighter">Broadcasting...</span>
                  ) : contact.mood ? (
                    <span className="text-[var(--accent-primary)] font-bold">{contact.mood.emoji} {contact.mood.text}</span>
                  ) : contact.bio}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* FAB MENU */}
      {showFabMenu && (
        <>
          <div className="absolute bottom-24 right-8 z-[200] animate-in slide-in-from-bottom-4 duration-300">
            <div className="glass p-3 rounded-3xl border border-white/10 shadow-2xl flex flex-col gap-2 min-w-[180px]">
              <button 
                onClick={() => { onOpenCreateCommunity('group'); setShowFabMenu(false); }}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/10 text-white transition-all text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <i className="fas fa-users"></i>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Создать группу</span>
              </button>
              <button 
                onClick={() => { onOpenCreateCommunity('channel'); setShowFabMenu(false); }}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/10 text-white transition-all text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
                  <i className="fas fa-bullhorn"></i>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Создать канал</span>
              </button>
            </div>
          </div>
          <div className="fixed inset-0 z-[150] bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowFabMenu(false)}></div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
