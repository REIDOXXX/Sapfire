
import React, { useState } from 'react';
import { AppUser, UserSettings, ThemeKey, Contact } from '../types';
import { useSettings } from '../context/SettingsContext';
import ChangePasswordModal from './ChangePasswordModal';
import ActiveSessionsModal from './ActiveSessionsModal';
import BlacklistModal from './BlacklistModal';

interface SettingsViewProps {
  user: AppUser;
  contacts: Contact[];
  onUpdateSetting: (key: keyof UserSettings, value: any) => void;
  onNavigateToEditProfile: () => void;
  onLogout: () => void;
  onShowToast: (msg: string) => void;
}

type SettingType = 'toggle' | 'value' | 'link' | 'action' | 'select';

interface SettingItem {
  id: string;
  icon: string;
  label: string;
  type: SettingType;
  settingKey?: keyof UserSettings;
  valueLabel?: string;
  action?: () => void;
  color?: string;
  description?: string;
  options?: { label: string, value: any }[];
}

interface SettingGroup {
  title: string;
  items: SettingItem[];
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, contacts, onUpdateSetting, onNavigateToEditProfile, onLogout, onShowToast }) => {
  const { settings, t, themeList } = useSettings();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);

  const SETTINGS_GROUPS: SettingGroup[] = [
    {
      title: 'Аккаунт',
      items: [
        { id: 'edit_profile', icon: 'fa-user-pen', label: 'Редактировать профиль', type: 'action', action: onNavigateToEditProfile },
        { id: 'password', icon: 'fa-key', label: 'Смена пароля', type: 'action', valueLabel: '••••••', action: () => setShowPasswordModal(true) },
        { id: '2fa', icon: 'fa-shield-halved', label: 'Двухфакторная аутентификация', type: 'toggle', settingKey: 'twoFactorAuth' },
        { id: 'sessions', icon: 'fa-laptop-code', label: 'Активные сеансы', type: 'action', valueLabel: `${settings.activeSessions || 1} устройств`, action: () => setShowSessionsModal(true) },
        { id: 'delete', icon: 'fa-trash-can', label: 'Удалить аккаунт', type: 'link', color: 'text-red-500' },
      ]
    },
    {
      title: 'Внешний вид',
      items: [
        { id: 'mood_theme', icon: 'fa-wand-magic-sparkles', label: 'Тема под настроение', type: 'toggle', settingKey: 'moodThemeEnabled', description: 'Авто-смена цветов приложения' },
        { id: 'dark_theme', icon: 'fa-moon', label: 'Темная тема', type: 'toggle', settingKey: 'privacyMode' },
        { 
          id: 'theme_select', 
          icon: 'fa-palette', 
          label: 'Выбор цвета темы', 
          type: 'select', 
          settingKey: 'themeType', 
          // Fix: Explicitly cast themeList item to any to avoid "unknown" type error on .label
          valueLabel: (themeList[settings.themeType] as any).label,
          options: Object.entries(themeList).map(([key, val]) => ({ label: (val as any).label, value: key }))
        },
        { id: 'font_size', icon: 'fa-font', label: 'Размер шрифта', type: 'value', valueLabel: `${settings.fontSize}px`, action: () => onUpdateSetting('fontSize', settings.fontSize >= 20 ? 12 : settings.fontSize + 2) },
        { id: 'wallpaper', icon: 'fa-image', label: 'Фон чатов', type: 'link', valueLabel: 'Стандарт' },
        { id: 'animations', icon: 'fa-clapperboard', label: 'Анимации интерфейса', type: 'toggle', settingKey: 'animationsEnabled' },
        { id: 'read_receipts', icon: 'fa-check-double', label: 'Скрыть время прочтения', type: 'toggle', settingKey: 'readReceipts' },
      ]
    },
    {
      title: 'Уведомления',
      items: [
        { id: 'notif_sound', icon: 'fa-volume-high', label: 'Звук сообщений', type: 'toggle', settingKey: 'notifSound' },
        { id: 'notif_vibrate', icon: 'fa-mobile-vibration', label: 'Вибрация', type: 'toggle', settingKey: 'notifVibrate' },
        { id: 'notif_preview', icon: 'fa-eye', label: 'Предпросмотр текста', type: 'toggle', settingKey: 'notifPreview' },
        { id: 'notif_groups', icon: 'fa-users-gear', label: 'Уведомления групп', type: 'toggle', settingKey: 'notifGroups' },
        { id: 'dnd_mode', icon: 'fa-moon', label: 'Режим "Не беспокоить"', type: 'toggle', settingKey: 'dndMode' },
        { id: 'notif_repeat', icon: 'fa-rotate-right', label: 'Повтор уведомлений', type: 'value', valueLabel: 'Никогда' },
      ]
    },
    {
      title: 'Конфиденциальность',
      items: [
        { id: 'phone_privacy', icon: 'fa-phone-slash', label: 'Кто видит мой номер', type: 'value', valueLabel: 'Никто' },
        { id: 'status_privacy', icon: 'fa-clock', label: 'Кто видит "В сети"', type: 'value', valueLabel: 'Контакты' },
        { id: 'blacklist', icon: 'fa-ban', label: 'Черный список', type: 'action', valueLabel: `${(settings.blockList || []).length}`, action: () => setShowBlacklistModal(true) },
        { id: 'auto_delete', icon: 'fa-stopwatch', label: 'Удаление по таймеру', type: 'toggle', settingKey: 'autoDeleteMessages' },
        { id: 'call_privacy', icon: 'fa-phone-lock', label: 'Запрет звонков', type: 'toggle', settingKey: 'privacyMode' },
        { id: 'passcode', icon: 'fa-fingerprint', label: 'Код-пароль на приложение', type: 'toggle', settingKey: 'biometricEnable' },
      ]
    },
    {
      title: 'Данные и память',
      items: [
        { id: 'auto_wifi', icon: 'fa-wifi', label: 'Автозагрузка (Wi-Fi)', type: 'toggle', settingKey: 'autoDownloadMedia' },
        { id: 'auto_mobile', icon: 'fa-tower-cell', label: 'Автозагрузка (Моб. сеть)', type: 'toggle', settingKey: 'lowDataMode' },
        { id: 'clear_cache', icon: 'fa-broom', label: 'Очистить кэш', type: 'action', valueLabel: '128 MB', action: () => onShowToast('Кэш успешно очищен') },
        { id: 'storage_limit', icon: 'fa-database', label: 'Лимит хранилища', type: 'value', valueLabel: '5 GB' },
        { id: 'media_quality', icon: 'fa-photo-film', label: 'Качество загрузки фото', type: 'value', valueLabel: 'Высокое' },
        { id: 'call_data_save', icon: 'fa-leaf', label: 'Экономия трафика (звонки)', type: 'toggle', settingKey: 'lowDataMode' },
      ]
    },
    {
      title: 'Язык и Регион',
      items: [
        { 
          id: 'language', 
          icon: 'fa-language', 
          label: 'Выбор языка', 
          type: 'select', 
          settingKey: 'language',
          valueLabel: settings.language === 'ru' ? 'RU' : 'EN',
          options: [{ label: 'RU', value: 'ru' }, { label: 'EN', value: 'en' }]
        },
        { id: 'time_format', icon: 'fa-clock', label: 'Формат времени', type: 'value', valueLabel: '24ч' },
        { id: 'timezone', icon: 'fa-earth-europe', label: 'Часовой пояс', type: 'value', valueLabel: 'Auto (GMT+3)' },
        { id: 'first_day', icon: 'fa-calendar-day', label: 'Первый день недели', type: 'value', valueLabel: 'Понедельник' },
      ]
    },
    {
      title: 'Помощь и Информация',
      items: [
        { id: 'ask_question', icon: 'fa-circle-question', label: 'Задать вопрос', type: 'link' },
        { id: 'report_bug', icon: 'fa-bug', label: 'Сообщить об ошибке', type: 'link' },
        { id: 'privacy_policy', icon: 'fa-file-shield', label: 'Политика конфиденциальности', type: 'link' },
        { id: 'about_app', icon: 'fa-circle-info', label: 'О приложении', type: 'value', valueLabel: 'v5.0.2 Stable' },
        { id: 'check_updates', icon: 'fa-rotate', label: 'Проверить обновления', type: 'action', action: () => onShowToast('У вас установлена последняя версия') },
        { id: 'hardware_accel', icon: 'fa-microchip', label: 'Аппаратное ускорение', type: 'toggle', settingKey: 'hardwareAccel' },
      ]
    }
  ];

  return (
    <>
      <div className="h-full overflow-y-auto custom-scrollbar animate-in fade-in pb-40 bg-black/20">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
           <h2 className="text-xl font-black text-white uppercase italic tracking-wider">Центр управления</h2>
        </div>

        <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-10">
          
          {/* Quick Profile Access */}
          <div onClick={onNavigateToEditProfile} className="group cursor-pointer relative overflow-hidden p-6 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/20 hover:shadow-2xl transition-all">
            <div className="flex items-center gap-5">
               <div className="relative">
                 <img src={user.avatar} className="w-16 h-16 rounded-2xl border border-white/10 group-hover:border-[var(--accent-primary)] transition-all object-cover" alt="Avatar" />
                 <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
               </div>
               <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-white uppercase italic truncate">{user.name}</h3>
                  <p className="text-xs text-slate-400 font-bold truncate">@{user.username} • <span className="text-[var(--accent-primary)]">Premium Access</span></p>
               </div>
               <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all">
                  <i className="fas fa-chevron-right"></i>
               </div>
            </div>
          </div>

          {/* Render Groups Dynamically */}
          {SETTINGS_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-4">{group.title}</h3>
              <div className="bg-[#0a0a0a]/60 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden">
                {group.items.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-5 border-b border-white/5 last:border-none hover:bg-white/[0.02] transition-colors cursor-pointer ${item.type === 'toggle' ? '' : 'active:bg-white/5'}`}
                    onClick={() => {
                      if (item.type === 'toggle' && item.settingKey) {
                        onUpdateSetting(item.settingKey, !settings[item.settingKey]);
                      } else if (item.type === 'select' && item.settingKey && item.options) {
                        const currentIdx = item.options.findIndex(o => o.value === settings[item.settingKey!]);
                        const nextOption = item.options[(currentIdx + 1) % item.options.length];
                        onUpdateSetting(item.settingKey, nextOption.value);
                      } else if (item.action) {
                        item.action();
                      }
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${item.color ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-slate-400'}`}>
                        <i className={`fas ${item.icon} ${item.color || ''}`}></i>
                      </div>
                      <div className="flex flex-col">
                         <span className={`text-sm font-bold ${item.color ? 'text-red-500' : 'text-slate-200'}`}>{item.label}</span>
                         {item.description && <span className="text-[9px] text-slate-600 font-medium">{item.description}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Value Display */}
                      {(item.type === 'value' || item.type === 'select' || item.type === 'link' || item.type === 'action') && item.valueLabel && (
                        <span className="text-xs font-bold text-[var(--accent-primary)]">{item.valueLabel}</span>
                      )}

                      {/* Chevron for non-toggles */}
                      {(item.type === 'link' || item.type === 'select' || item.type === 'action') && (
                         <i className="fas fa-chevron-right text-xs text-slate-600"></i>
                      )}

                      {/* Switch for toggles */}
                      {item.type === 'toggle' && item.settingKey && (
                        <div className={`w-11 h-6 rounded-full relative transition-all duration-300 ${settings[item.settingKey] ? 'bg-[var(--accent-primary)]' : 'bg-white/10'}`}>
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${settings[item.settingKey] ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-6 pb-8">
             <button onClick={onLogout} className="w-full py-5 bg-red-600/10 text-red-500 rounded-[2.5rem] font-black uppercase tracking-widest text-xs border border-red-500/20 hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
               <i className="fas fa-power-off"></i>
               Выйти из системы
             </button>
             <p className="text-center text-[9px] font-bold text-slate-700 uppercase tracking-widest mt-8">
               Sapfire Core v5.0.2 Stable
               <br/>
               Node Status: Encrypted & Optimized
             </p>
          </div>
        </div>
      </div>
      
      <ChangePasswordModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => onShowToast('Пароль успешно изменен!')}
      />

      <ActiveSessionsModal 
        isOpen={showSessionsModal}
        onClose={() => setShowSessionsModal(false)}
        onShowToast={onShowToast}
        onUpdateCount={(count) => onUpdateSetting('activeSessions', count)}
      />

      <BlacklistModal 
        isOpen={showBlacklistModal}
        onClose={() => setShowBlacklistModal(false)}
        blockList={settings.blockList || []}
        contacts={contacts}
        onUpdateBlockList={(newList) => onUpdateSetting('blockList', newList)}
        onShowToast={onShowToast}
      />
    </>
  );
};

export default SettingsView;
