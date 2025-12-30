
export enum ViewType {
  CHAT = 'chat',
  SETTINGS = 'settings',
  PROFILE = 'profile',
  WALLET = 'wallet',
  CALLS = 'calls',
  LIVE = 'live',
  STORE = 'store',
  CREATOR = 'creator'
}

export interface MoodStatus {
  emoji: string;
  text: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: 'in' | 'out';
  label: string;
  user: string;
  amount: number;
  date: number;
  contactId?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'background' | 'frame' | 'mood' | 'badge';
  previewIcon: string;
  accentColor: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system' | 'admin';
  content: string;
  timestamp: number;
  senderName?: string;
  senderId?: string;
  senderColor?: string;
  views?: number;
  attachment?: {
    type: 'image' | 'video' | 'file' | 'audio';
    url: string;
    name?: string;
  };
  reactions?: string[];
  isTransfer?: boolean;
  transferAmount?: number;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  type: 'image' | 'video';
  timestamp: number;
  viewed: boolean;
}

export interface LiveStream {
  id: string;
  title: string;
  hostName: string;
  hostAvatar: string;
  previewUrl: string;
  viewers: string | number;
}

export type ContactType = 'direct' | 'group' | 'channel';

export interface Contact {
  id: string;
  type: ContactType;
  name: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  mood?: MoodStatus;
  lastMessage?: string;
  messages: Message[];
  bio: string;
  location: string;
  website: string;
  phone: string;
  isAI?: boolean;
  isPinned?: boolean;
  isVerified?: boolean;
  role?: 'admin' | 'moderator' | 'developer' | 'pro';
  ownerId?: string;
  participantIds?: string[];
}

export type ThemeKey = 'cyber' | 'magma' | 'emerald' | 'magic' | 'noir' | 'aether' | 'cosmos' | 'liquid' | 'neon';

export interface UserSettings {
  themeType: ThemeKey;
  accentColor: string;
  animationsEnabled: boolean;
  animationSpeed: number;
  compactMode: boolean;
  fontSize: number;
  fontWeight: number;
  borderRadius: number;
  glassOpacity: number;
  blurIntensity: number;
  glowPower: number;
  chatWallpaper: string;
  moodThemeEnabled: boolean; 
  twoFactorAuth: boolean;
  passcodeLock: boolean;
  activeSessions: number;
  privacyMode: boolean;
  notifSound: boolean;
  notifPreview: boolean;
  notifVibrate: boolean;
  notifStories: boolean;
  notifCalls: boolean;
  notifGroups: boolean;
  dndMode: boolean;
  autoDownloadMedia: boolean;
  lowDataMode: boolean;
  cacheLimit: number;
  mediaQuality: 'high' | 'medium' | 'low';
  saveToGallery: boolean;
  lastSeen: 'everyone' | 'contacts' | 'nobody';
  readReceipts: boolean;
  profileVisibility: boolean;
  biometricEnable: boolean;
  incognitoChat: boolean;
  blockList: string[];
  hidePhoneNumber: boolean;
  autoDeleteMessages: boolean;
  language: 'ru' | 'en';
  timeFormat: '12h' | '24h';
  timezone: string;
  sidebarWidth: number;
  headerBlur: boolean;
  showUserStatus: boolean;
  ghostMode: boolean;
  screenShield: boolean;
  hardwareAccel: boolean;
  autoUpdate: boolean;
  experimentalFeatures: boolean;
  debugMode: boolean;
  [key: string]: any;
}

export interface AppUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  balance: number;
  level: number;
  settings: UserSettings;
  mood?: MoodStatus;
  inventory: string[];
  activeBackground?: string;
  activeFrame?: string;
}
