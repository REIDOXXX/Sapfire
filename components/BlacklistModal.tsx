
import React, { useState, useMemo } from 'react';
import { Contact } from '../types';

interface BlockedUserInfo {
  id: string;
  name: string;
  avatar: string;
  date: string;
}

interface BlacklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockList: string[];
  contacts: Contact[];
  onUpdateBlockList: (newList: string[]) => void;
  onShowToast: (msg: string) => void;
}

const BlacklistModal: React.FC<BlacklistModalProps> = ({ 
  isOpen, 
  onClose, 
  blockList, 
  contacts, 
  onUpdateBlockList,
  onShowToast 
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Map IDs to actual contact info + mock block dates
  const blockedUsersData: BlockedUserInfo[] = useMemo(() => {
    return blockList.map(id => {
      const contact = contacts.find(c => c.id === id);
      return {
        id,
        name: contact?.name || 'Пользователь ' + id,
        avatar: contact?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
        date: '15 Октября, 2023' // Mock date
      };
    });
  }, [blockList, contacts]);

  const handleUnblock = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      const newList = blockList.filter(item => item !== id);
      onUpdateBlockList(newList);
      setRemovingId(null);
      onShowToast('Пользователь разблокирован');
    }, 300);
  };

  const handleBlockContact = (id: string) => {
    if (!blockList.includes(id)) {
      onUpdateBlockList([...blockList, id]);
      onShowToast('Пользователь добавлен в черный список');
    }
    setShowPicker(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-lg bg-[#050505] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <i className="fas fa-ban text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase italic tracking-wider">Черный список</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Управление блокировками</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Action Button */}
        <div className="p-6">
          <button 
            onClick={() => setShowPicker(true)}
            className="w-full py-4 bg-white/5 border border-dashed border-white/10 rounded-2xl text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3 group"
          >
            <i className="fas fa-user-plus text-[var(--accent-primary)] group-hover:scale-110 transition-transform"></i>
            <span className="text-xs font-black uppercase tracking-widest">Заблокировать пользователя</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-8 space-y-4">
          {blockedUsersData.length > 0 ? (
            <div className="space-y-3">
              {blockedUsersData.map(user => (
                <div 
                  key={user.id} 
                  className={`flex items-center gap-4 p-4 rounded-[1.5rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all duration-300 ${removingId === user.id ? 'opacity-0 scale-95 translate-x-4' : 'opacity-100'}`}
                >
                  <img src={user.avatar} className="w-12 h-12 rounded-xl border border-white/10" alt={user.name} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-white truncate">{user.name}</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Заблокирован: {user.date}</p>
                  </div>
                  <button 
                    onClick={() => handleUnblock(user.id)}
                    className="px-4 py-2 rounded-xl bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all"
                  >
                    Разблокировать
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 opacity-40">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <i className="fas fa-shield-halved text-4xl text-slate-400"></i>
              </div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] max-w-[200px]">
                В вашем черном списке пока нет пользователей
              </p>
            </div>
          )}
        </div>

        {/* Contact Picker Overlay */}
        {showPicker && (
          <div className="absolute inset-0 z-50 bg-[#050505] flex flex-col animate-in slide-in-from-bottom-full duration-500">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
              <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Выберите контакт</h4>
              <button onClick={() => setShowPicker(false)} className="text-slate-500 hover:text-white transition-colors">
                Отмена
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-2">
              {contacts.filter(c => !blockList.includes(c.id)).map(contact => (
                <button 
                  key={contact.id}
                  onClick={() => handleBlockContact(contact.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all text-left group"
                >
                  <img src={contact.avatar} className="w-10 h-10 rounded-xl border border-white/5" alt={contact.name} />
                  <span className="flex-1 text-sm font-bold text-slate-300 group-hover:text-white">{contact.name}</span>
                  <i className="fas fa-plus text-slate-600 group-hover:text-red-500"></i>
                </button>
              ))}
              {contacts.filter(c => !blockList.includes(c.id)).length === 0 && (
                <p className="text-center text-xs text-slate-600 font-bold uppercase py-10">Нет доступных контактов</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlacklistModal;
