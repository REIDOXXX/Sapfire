
import React, { useState } from 'react';
import { AppUser, MoodStatus } from '../types';
import { useSettings } from '../context/SettingsContext';

interface EditProfileViewProps {
  user: AppUser;
  onSave: (updatedData: Partial<AppUser>) => void;
  onBack: () => void;
}

const MOOD_PRESETS: MoodStatus[] = [
  { emoji: '🎯', text: 'Сосредоточен', color: '#3b82f6' },
  { emoji: '☕', text: 'Отдыхаю', color: '#8b5e3c' },
  { emoji: '⚡', text: 'Энергичен', color: '#f59e0b' },
  { emoji: '😴', text: 'Хочу спать', color: '#8b5cf6' },
  { emoji: '🎮', text: 'Играю', color: '#22c55e' },
  { emoji: '💡', text: 'Идея', color: '#fbbf24' },
  { emoji: '🎧', text: 'В музыке', color: '#ec4899' },
  { emoji: '🚀', text: 'Занят делом', color: '#06b6d4' }
];

const EditProfileView: React.FC<EditProfileViewProps> = ({ user, onSave, onBack }) => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    bio: user.bio,
    phone: user.phone || '',
    avatar: user.avatar,
    mood: user.mood
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectMood = (mood: MoodStatus) => {
    setFormData(prev => ({ ...prev, mood: prev.mood?.emoji === mood.emoji ? undefined : mood }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar animate-in slide-in-from-right-8 duration-500 bg-black/20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <i className="fas fa-arrow-left"></i>
          <span className="text-xs font-bold uppercase tracking-widest">Назад</span>
        </button>
        <h2 className="text-sm font-black text-white uppercase tracking-widest">Редактирование</h2>
        <button onClick={handleSave} className="text-[var(--accent-primary)] text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
          Сохранить
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-6 md:p-12 space-y-10 pb-32">
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group cursor-pointer">
            <div 
              className="w-32 h-32 rounded-full border-4 border-white/5 overflow-hidden relative shadow-2xl transition-all duration-500"
              style={formData.mood ? { boxShadow: `0 0 30px ${formData.mood.color}66` } : {}}
            >
              <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fas fa-camera text-3xl text-white drop-shadow-lg"></i>
              </div>
              {formData.mood && (
                <div className="absolute inset-0 pointer-events-none border-4 rounded-full" style={{ borderColor: formData.mood.color, opacity: 0.3 }}></div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-[var(--accent-primary)] rounded-full text-white flex items-center justify-center border-4 border-[var(--bg-base)] shadow-lg hover:scale-110 transition-transform">
              <i className="fas fa-pen text-xs"></i>
            </button>
            {formData.mood && (
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-xl shadow-xl animate-in zoom-in">
                {formData.mood.emoji}
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Нажмите для изменения фото</p>
        </div>

        {/* Mood Selector */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Мое настроение</label>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {MOOD_PRESETS.map((mood) => (
              <button
                key={mood.text}
                onClick={() => selectMood(mood)}
                className={`aspect-square rounded-2xl flex items-center justify-center text-xl transition-all duration-300 relative group ${formData.mood?.emoji === mood.emoji ? 'bg-white/10 border-2 border-white/20 scale-110 shadow-lg' : 'bg-white/5 border border-white/5 hover:bg-white/10'}`}
                style={formData.mood?.emoji === mood.emoji ? { boxShadow: `0 0 15px ${mood.color}44` } : {}}
              >
                {mood.emoji}
                {/* Tooltip */}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[8px] text-white font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {mood.text}
                </span>
              </button>
            ))}
          </div>
          {formData.mood && (
             <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl animate-in fade-in slide-in-from-top-2">
                <span className="text-2xl">{formData.mood.emoji}</span>
                <div className="flex-1">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Текущий статус</p>
                   <p className="text-sm font-bold text-white uppercase italic">{formData.mood.text}</p>
                </div>
                <button onClick={() => setFormData(prev => ({ ...prev, mood: undefined }))} className="text-slate-600 hover:text-red-500 transition-colors">
                  <i className="fas fa-times-circle"></i>
                </button>
             </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Отображаемое имя</label>
               <div className="relative group">
                 <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[var(--accent-primary)] transition-colors"></i>
                 <input 
                   type="text" 
                   name="name"
                   value={formData.name}
                   onChange={handleChange}
                   className="w-full h-14 bg-[#0a0a0a] border border-white/10 rounded-2xl pl-12 pr-4 text-white text-sm font-medium outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/50 transition-all placeholder:text-slate-700"
                   placeholder="Ваше имя"
                 />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Имя пользователя</label>
               <div className="relative group">
                 <i className="fas fa-at absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[var(--accent-primary)] transition-colors"></i>
                 <input 
                   type="text" 
                   name="username"
                   value={formData.username}
                   onChange={handleChange}
                   className="w-full h-14 bg-[#0a0a0a] border border-white/10 rounded-2xl pl-12 pr-4 text-white text-sm font-medium outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/50 transition-all placeholder:text-slate-700"
                   placeholder="username"
                 />
               </div>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">О себе (Bio)</label>
            <div className="relative group">
              <i className="fas fa-quote-left absolute left-4 top-5 text-slate-600 group-focus-within:text-[var(--accent-primary)] transition-colors"></i>
              <textarea 
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm font-medium outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/50 transition-all placeholder:text-slate-700 resize-none"
                placeholder="Расскажите немного о себе..."
              />
            </div>
            <p className="text-right text-[9px] text-slate-600 font-bold">{formData.bio.length}/150</p>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Номер телефона</label>
             <div className="relative group">
               <i className="fas fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[var(--accent-primary)] transition-colors"></i>
               <input 
                 type="tel" 
                 name="phone"
                 value={formData.phone}
                 onChange={handleChange}
                 className="w-full h-14 bg-[#0a0a0a] border border-white/10 rounded-2xl pl-12 pr-4 text-white text-sm font-medium outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/50 transition-all placeholder:text-slate-700"
                 placeholder="+7 (999) 000-00-00"
               />
             </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full h-14 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[var(--accent-primary)] hover:text-white transition-all shadow-xl active:scale-[0.98]"
        >
          Сохранить изменения
        </button>

      </div>
    </div>
  );
};

export default EditProfileView;
