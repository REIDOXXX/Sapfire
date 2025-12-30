
import React, { useState } from 'react';
import { AppUser, ShopItem } from '../types';

interface StoreViewProps {
  user: AppUser;
  onPurchase: (item: ShopItem) => void;
}

const STORE_ITEMS: ShopItem[] = [
  { id: 'bg_cyber', name: 'Киберпанк Фон', description: 'Неоновые улицы ночного города в ваших чатах.', price: 1500, category: 'background', previewIcon: 'fa-city', accentColor: '#2563eb' },
  { id: 'bg_cosmos', name: 'Глубокий Космос', description: 'Звезды и туманности для спокойного общения.', price: 2000, category: 'background', previewIcon: 'fa-user-astronaut', accentColor: '#7c3aed' },
  { id: 'frame_gold', name: 'Золотая Рамка', description: 'Премиальное обрамление вашего аватара в списке.', price: 5000, category: 'frame', previewIcon: 'fa-crown', accentColor: '#fbbf24' },
  { id: 'mood_premium', name: 'Elite Moods', description: 'Разблокирует 5 эксклюзивных анимированных статусов.', price: 3500, category: 'mood', previewIcon: 'fa-wand-magic-sparkles', accentColor: '#ec4899' },
  { id: 'badge_verified', name: 'Верификация', description: 'Синяя галочка подтвержденного жителя Sapfire.', price: 10000, category: 'badge', previewIcon: 'fa-check-circle', accentColor: '#06b6d4' },
];

const StoreView: React.FC<StoreViewProps> = ({ user, onPurchase }) => {
  const [filter, setFilter] = useState<string>('all');

  const filteredItems = filter === 'all' 
    ? STORE_ITEMS 
    : STORE_ITEMS.filter(item => item.category === filter);

  return (
    <div className="h-full overflow-y-auto p-6 md:p-12 custom-scrollbar animate-in fade-in">
      <div className="max-w-6xl mx-auto space-y-12 pb-24">
        {/* Banner */}
        <div className="relative overflow-hidden p-10 md:p-16 rounded-[3.5rem] bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 border border-white/10 shadow-2xl">
           <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                 <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase">Sapfire Store</h2>
                 <p className="text-slate-400 max-w-md font-medium">Ваш баланс: <span className="text-white font-black">{user.balance.toLocaleString()} SAP</span>. Инвестируйте в свой цифровой облик.</p>
              </div>
              <div className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center text-3xl shadow-2xl animate-bounce">
                 <i className="fas fa-shopping-bag"></i>
              </div>
           </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 justify-center">
          {['all', 'background', 'frame', 'mood', 'badge'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-white text-black shadow-xl scale-105' : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}
            >
              {cat === 'all' ? 'Все' : cat === 'background' ? 'Фоны' : cat === 'frame' ? 'Рамки' : cat === 'mood' ? 'Эмодзи' : 'Значки'}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => {
            const isOwned = user.inventory.includes(item.id);
            const isActive = user.activeBackground === item.id || user.activeFrame === item.id || (isOwned && item.category === 'badge');
            
            return (
              <div key={item.id} className="group relative">
                <div className={`h-full p-8 rounded-[3rem] bg-white/[0.03] border border-white/5 flex flex-col gap-6 transition-all duration-500 hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-2 shadow-xl ${isActive ? 'ring-2 ring-[var(--accent-primary)] border-transparent' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-2xl" style={{ backgroundColor: `${item.accentColor}22`, color: item.accentColor, border: `1px solid ${item.accentColor}44` }}>
                      <i className={`fas ${item.previewIcon}`}></i>
                    </div>
                    {isOwned && (
                      <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest rounded-lg border border-green-500/20">Куплено</span>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <h3 className="text-xl font-black text-white italic">{item.name}</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                       <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Стоимость</p>
                       <p className="text-lg font-black text-white">{isOwned ? '—' : `${item.price.toLocaleString()} SAP`}</p>
                    </div>
                    <button 
                      onClick={() => onPurchase(item)}
                      className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-[var(--accent-primary)] text-white shadow-xl' : isOwned ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-black hover:bg-[var(--accent-primary)] hover:text-white active:scale-95 shadow-lg'}`}
                    >
                      {isActive ? 'Активно' : isOwned ? 'Применить' : 'Купить'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info */}
        <div className="text-center p-12 opacity-30">
           <i className="fas fa-info-circle text-2xl mb-4"></i>
           <p className="text-[10px] font-bold uppercase tracking-[0.3em] max-w-sm mx-auto">Все покупки являются виртуальными и действуют только внутри экосистемы Sapfire.</p>
        </div>
      </div>
    </div>
  );
};

export default StoreView;
