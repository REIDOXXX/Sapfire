
import React, { useState, useMemo } from 'react';
import { Contact, ContactType } from '../types';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onCreate: (data: { name: string, description: string, type: ContactType, participantIds: string[] }) => void;
  initialType?: ContactType;
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ 
  isOpen, 
  onClose, 
  contacts, 
  onCreate,
  initialType = 'group'
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ContactType>(initialType);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => 
      c.type === 'direct' && 
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       c.username.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [contacts, searchQuery]);

  if (!isOpen) return null;

  const toggleParticipant = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      description: description.trim(),
      type,
      // For channels, we don't necessarily add everyone immediately by UI rule, 
      // but we keep the owner 'me'.
      participantIds: type === 'channel' ? ['me'] : ['me', ...selectedIds]
    });
    // Reset and close
    setName('');
    setDescription('');
    setSelectedIds([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-[#050505] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-wider">
              {type === 'group' ? 'Создать группу' : 'Создать канал'}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Новое сообщество Sapfire</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
          {/* Main Info */}
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-3xl text-white shadow-2xl border-2 border-white/10 transition-all duration-500 ${type === 'channel' ? 'bg-gradient-to-br from-blue-500 to-indigo-700' : 'bg-gradient-to-br from-emerald-500 to-teal-700'}`}>
                {name ? name.charAt(0).toUpperCase() : <i className={`fas ${type === 'channel' ? 'fa-bullhorn' : 'fa-users'}`}></i>}
              </div>
              <button className="text-[9px] font-black text-[var(--accent-primary)] uppercase tracking-widest hover:text-white transition-colors">Сменить аватар</button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Название</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Назовите сообщество..."
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white text-sm font-bold outline-none focus:border-[var(--accent-primary)] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Описание (Опционально)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="О чем этот чат?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white font-medium outline-none focus:border-[var(--accent-primary)] transition-all resize-none h-24"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${type === 'channel' ? 'bg-blue-500/20 text-blue-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                      <i className={`fas ${type === 'channel' ? 'fa-bullhorn' : 'fa-users'}`}></i>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">{type === 'channel' ? 'Публичный канал' : 'Групповой чат'}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                        {type === 'channel' ? 'Только вы можете отправлять сообщения' : 'Все участники могут общаться'}
                      </p>
                   </div>
                </div>
                <button 
                  onClick={() => setType(type === 'channel' ? 'group' : 'channel')}
                  className="w-12 h-6 bg-white/10 rounded-full relative transition-all"
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${type === 'channel' ? 'right-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'left-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Participants Selection - Only show for groups */}
          {type === 'group' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex justify-between items-end px-1">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Участники ({selectedIds.length})</h4>
                 {selectedIds.length > 0 && (
                   <button onClick={() => setSelectedIds([])} className="text-[9px] font-black text-red-500 uppercase tracking-widest">Очистить</button>
                 )}
              </div>

              <div className="relative group">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[var(--accent-primary)] transition-colors"></i>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск контактов..."
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-xs text-white outline-none focus:border-white/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {filteredContacts.map(contact => (
                  <button 
                    key={contact.id}
                    onClick={() => toggleParticipant(contact.id)}
                    className={`flex items-center gap-4 p-3 rounded-2xl transition-all border ${selectedIds.includes(contact.id) ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                  >
                    <img src={contact.avatar} className="w-10 h-10 rounded-xl object-cover" alt={contact.name} />
                    <div className="flex-1 text-left">
                      <p className="text-xs font-black text-white uppercase tracking-wide">{contact.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold tracking-widest">@{contact.username}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${selectedIds.includes(contact.id) ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white' : 'border-white/10'}`}>
                      {selectedIds.includes(contact.id) && <i className="fas fa-check text-[10px]"></i>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {type === 'channel' && (
            <div className="p-8 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/10 text-center space-y-4 animate-in fade-in zoom-in duration-500">
               <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto text-blue-500">
                  <i className="fas fa-bullhorn text-2xl"></i>
               </div>
               <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Вещательный канал</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase mt-2">
                    В каналах участники подписываются самостоятельно. Вы сможете пригласить их по ссылке после создания.
                  </p>
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-[#050505]">
          <button 
            onClick={handleCreate}
            disabled={!name.trim()}
            className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 ${name.trim() ? 'bg-white text-black hover:bg-[var(--accent-primary)] hover:text-white active-glow' : 'bg-white/5 text-slate-700 cursor-not-allowed border border-white/5'}`}
          >
            Создать {type === 'channel' ? 'канал' : 'группу'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunityModal;
