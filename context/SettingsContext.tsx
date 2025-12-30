
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSettings, ThemeKey, MoodStatus } from '../types';

const DEFAULT_SETTINGS: UserSettings = {
  themeType: 'cyber',
  accentColor: '#3b82f6',
  animationsEnabled: true,
  animationSpeed: 0.4,
  compactMode: false,
  language: 'ru',
  fontSize: 14,
  fontWeight: 500,
  borderRadius: 32,
  glassOpacity: 10,
  blurIntensity: 25,
  glowPower: 1,
  chatWallpaper: 'default',
  moodThemeEnabled: true, // Enabled by default
  twoFactorAuth: false,
  passcodeLock: false,
  activeSessions: 1,
  privacyMode: false,
  notifSound: true,
  notifPreview: true,
  notifVibrate: true,
  notifStories: true,
  notifCalls: true,
  notifGroups: true,
  dndMode: false,
  autoDownloadMedia: true,
  lowDataMode: false,
  cacheLimit: 512,
  mediaQuality: 'high',
  saveToGallery: false,
  lastSeen: 'everyone',
  readReceipts: true,
  profileVisibility: true,
  biometricEnable: true,
  incognitoChat: false,
  blockList: [],
  hidePhoneNumber: false,
  autoDeleteMessages: false,
  timeFormat: '24h',
  timezone: 'Auto',
  sidebarWidth: 380,
  headerBlur: true,
  showUserStatus: true,
  ghostMode: false,
  screenShield: false,
  hardwareAccel: true,
  autoUpdate: true,
  experimentalFeatures: false,
  debugMode: false,
  letterSpacing: -0.01,
  meshIntensity: 35
};

const THEME_MAP: Record<ThemeKey, { p: string, s: string, bg: string, label: string, icon: string, trend?: boolean }> = {
  cyber: { p: '#3b82f6', s: '#8b5cf6', bg: '#030303', label: 'Кибер', icon: 'fa-microchip' },
  magma: { p: '#ef4444', s: '#f59e0b', bg: '#050101', label: 'Магма', icon: 'fa-fire' },
  emerald: { p: '#10b981', s: '#06b6d4', bg: '#010504', label: 'Изумруд', icon: 'fa-gem' },
  magic: { p: '#d946ef', s: '#6366f1', bg: '#040105', label: 'Магия', icon: 'fa-wand-magic-sparkles' },
  noir: { p: '#94a3b8', s: '#1e293b', bg: '#000000', label: 'Нуар', icon: 'fa-moon' },
  aether: { p: '#fbbf24', s: '#3b82f6', bg: '#020617', label: 'Эфир', icon: 'fa-wind', trend: true },
  cosmos: { p: '#ec4899', s: '#8b5cf6', bg: '#0f0716', label: 'Космос', icon: 'fa-user-astronaut', trend: true },
  liquid: { p: '#ffffff', s: '#94a3b8', bg: '#050505', label: 'Ртуть', icon: 'fa-droplet', trend: true },
  neon: { p: '#22c55e', s: '#06b6d4', bg: '#010801', label: 'Неон', icon: 'fa-bolt', trend: true }
};

interface SettingsContextType {
  settings: UserSettings;
  updateSetting: (key: keyof UserSettings, value: any) => void;
  t: (key: string) => string;
  theme: typeof THEME_MAP['cyber'];
  themeList: typeof THEME_MAP;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('sapfire_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('sapfire_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    let theme = THEME_MAP[settings.themeType];
    
    // Check if mood theme is enabled and user has a mood
    const savedMood = localStorage.getItem('sapfire_mood');
    if (settings.moodThemeEnabled && savedMood) {
      try {
        const mood = JSON.parse(savedMood) as MoodStatus;
        // Override primary and secondary colors with mood colors
        // We use the mood color as primary and a slightly adjusted version as secondary
        theme = {
          ...theme,
          p: mood.color,
          s: mood.color + 'aa', // Semi-transparent secondary
          bg: mood.text === 'Хочу спать' ? '#020205' : theme.bg // Darker BG for sleep mood
        };
      } catch (e) {
        console.error("Mood parsing failed", e);
      }
    }
    
    // Apply variables with transition
    root.style.setProperty('--accent-primary', theme.p);
    root.style.setProperty('--accent-secondary', theme.s);
    root.style.setProperty('--bg-base', theme.bg);
    root.style.setProperty('--accent-glow', `${theme.p}66`);
    root.style.setProperty('--glow-power', `${settings.glowPower}`);
    root.style.setProperty('--glass-opacity', `${settings.glassOpacity / 100}`);
    root.style.setProperty('--blur-intensity', `${settings.blurIntensity}px`);
    root.style.fontSize = `${settings.fontSize}px`;
    
    // Add transition to root for smooth mood changes
    root.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
  }, [settings.themeType, settings.glowPower, settings.glassOpacity, settings.blurIntensity, settings.fontSize, settings.moodThemeEnabled]);

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const t = (key: string) => {
    const lang = settings.language as 'ru' | 'en';
    const translations: any = {
      ru: {
        'Chats': 'Чаты',
        'Calls': 'Звонки',
        'Live': 'Эфир',
        'Wallet': 'Банк',
        'Settings': 'Опции',
        'Search': 'Поиск...',
        'Online': 'В сети',
        'Offline': 'Не в сети',
        'TypeMessage': 'Введите сообщение...',
        'SettingsTitle': 'Центр управления',
        'Account': 'Аккаунт',
        'Appearance': 'Внешний вид',
        'Notifications': 'Уведомления',
        'Data': 'Данные и память',
        'Privacy': 'Конфиденциальность',
        'Language': 'Язык',
        'Help': 'Помощь',
        'Change Password': 'Смена пароля',
        '2FA Auth': 'Двухфакторная аутентификация',
        'Active Sessions': 'Активные сеансы',
        'Delete Account': 'Удалить аккаунт',
        'Theme': 'Тема',
        'Font Size': 'Размер шрифта',
        'Animations': 'Анимации',
        'Compact Mode': 'Компактный режим',
        'Glow Effect': 'Эффект свечения',
        'Sound': 'Звук',
        'Vibration': 'Вибрация',
        'Text Preview': 'Предпросмотр текста',
        'Group Notifs': 'Уведомления групп',
        'Do Not Disturb': 'Не беспокоить',
        'Auto Download': 'Автозагрузка',
        'Media Quality': 'Качество медиа',
        'Clear Cache': 'Очистить кэш',
        'Low Data Mode': 'Экономия трафика',
        'Save to Gallery': 'Сохранять в галерею',
        'Last Seen': 'Время захода',
        'Block List': 'Черный список',
        'Hide Phone Number': 'Скрыть номер телефона',
        'Auto Delete Msg': 'Автоудаление сообщений',
        'Biometrics': 'Биометрия',
        'Time Format': 'Формат времени',
        'Support': 'Поддержка',
        'About': 'О программе',
        'Sign Out': 'Выйти из системы',
        'Pro Plan': 'Премиум доступ',
        'Everyone': 'Все',
        'Nobody': 'Никто',
        'High': 'Высокое',
        'Medium': 'Среднее',
        'devices': 'устройств',
        'Battery drain': 'Повышенный расход батареи',
        'Mood Theme': 'Тема под настроение'
      },
      en: {
        'Chats': 'Chats',
        'Calls': 'Calls',
        'Live': 'Live',
        'Wallet': 'Wallet',
        'Settings': 'Settings',
        'Search': 'Search...',
        'Online': 'Online',
        'Offline': 'Offline',
        'TypeMessage': 'Type a message...',
        'SettingsTitle': 'Control Center',
        'Account': 'Account',
        'Appearance': 'Appearance',
        'Notifications': 'Notifications',
        'Data': 'Data & Storage',
        'Privacy': 'Privacy',
        'Language': 'Language',
        'Help': 'Help',
        'Sign Out': 'Sign Out',
        'Battery drain': 'Battery drain',
        'Mood Theme': 'Mood-based theme'
      }
    };
    return translations[lang][key] || key;
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSetting, 
      t, 
      theme: THEME_MAP[settings.themeType],
      themeList: THEME_MAP
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
