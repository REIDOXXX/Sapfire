
import React, { useState, useEffect, useCallback } from 'react';
import { ViewType, AppUser, Contact, Message, Story as IStory, LiveStream, MoodStatus, Transaction, ShopItem, ContactType } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatView from './components/ChatView';
import WalletView from './components/WalletView';
import StoreView from './components/StoreView';
import ProfileView from './components/ProfileView';
import StoryViewer from './components/StoryViewer';
import LiveView from './components/LiveView';
import AuthView from './components/AuthView';
import EditProfileView from './components/EditProfileView';
import SettingsView from './components/SettingsView';
import CreatorView from './components/CreatorView';
import CreateCommunityModal from './components/CreateCommunityModal';
import { SapfireLogo } from './components/Logo';
import { useSettings } from './context/SettingsContext';

const INITIAL_STORIES: IStory[] = [
  { id: 's1', userId: 'c1', userName: 'Alex', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', mediaUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&w=800&q=80', type: 'image', timestamp: Date.now(), viewed: false },
  { id: 's2', userId: 'c2', userName: 'Maria', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria', mediaUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80', type: 'image', timestamp: Date.now() - 5000, viewed: false },
];

const INITIAL_STREAMS: LiveStream[] = [
  { id: 'l1', title: 'Late Night Coding: Project X', hostName: 'CyberDev', hostAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev', previewUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80', viewers: '1.2k' },
  { id: 'l2', title: 'Atmospheric Beats & Chill', hostName: 'NeonRhythm', hostAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neon', previewUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?auto=format&fit=crop&w=600&q=80', viewers: '850' },
  { id: 'l3', title: 'Future UI Design Masterclass', hostName: 'PixelQueen', hostAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pixel', previewUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=600&q=80', viewers: '2.4k' },
  { id: 'l4', title: 'Unboxing the Quantum Phone', hostName: 'TechVibe', hostAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech', previewUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80', viewers: '3.1k' },
];

const DEFAULT_CONTACTS: Contact[] = [
  { id: 'c1', type: 'direct', name: 'Alexander', username: 'alex', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', status: 'online', bio: 'AI researcher.', location: 'Mars', website: '', phone: '', messages: [], mood: { emoji: '🎯', text: 'Сосредоточен', color: '#3b82f6' } },
  { id: 'c2', type: 'direct', name: 'Maria', username: 'maria', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria', status: 'busy', bio: 'Art Director.', location: 'Cyber-City', website: '', phone: '', messages: [], mood: { emoji: '🎨', text: 'Творю шедевр', color: '#ec4899' } },
  { 
    id: 'g1', 
    type: 'group', 
    name: 'Sapfire Core Team', 
    username: 'core_team', 
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SCT', 
    status: 'online', 
    bio: 'Official group for Sapfire developers.', 
    location: 'Global', website: '', phone: '', 
    ownerId: 'some_other_id',
    messages: [
      { id: 'm0', role: 'system', content: 'Alexander добавил Maria в группу', timestamp: Date.now() - 3600000 },
      { id: 'm1', role: 'model', content: 'Привет всем! Давайте обсудим обновление.', timestamp: Date.now() - 1800000, senderName: 'Alexander', senderColor: '#3b82f6' }
    ], 
    participantIds: ['me', 'c1', 'c2'] 
  },
  { 
    id: 'ch1', 
    type: 'channel', 
    name: 'Sapfire News', 
    username: 'news_channel', 
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SN', 
    status: 'online', 
    bio: 'Daily updates from the futuristic world.', 
    location: 'Ether', website: '', phone: '', 
    ownerId: 'admin_id',
    messages: [
      { id: 'cm0', role: 'system', content: 'Канал создан', timestamp: Date.now() - 8000000 },
      { id: 'cm1', role: 'admin', content: 'Новое обновление v5.0.2 уже доступно! Проверьте вкладку "Магазин".', timestamp: Date.now() - 7200000, senderName: 'Sapfire News', senderColor: '#2563eb', views: 1240 }
    ] 
  }
];

const DesktopNav = ({ currentView, onNavigate }: { currentView: ViewType, onNavigate: (v: ViewType) => void }) => {
  const { t } = useSettings();
  const tabs = [
    { id: ViewType.CHAT, icon: 'fa-comment-dots', label: t('Chats') },
    { id: ViewType.LIVE, icon: 'fa-tower-broadcast', label: t('Live') },
    { id: ViewType.CREATOR, icon: 'fa-wand-magic-sparkles', label: 'Creator Lab' },
    { id: ViewType.STORE, icon: 'fa-shopping-cart', label: 'Store' },
    { id: ViewType.WALLET, icon: 'fa-wallet', label: t('Wallet') },
    { id: ViewType.SETTINGS, icon: 'fa-gear', label: t('Settings') },
  ];
  return (
    <nav className="hidden md:flex flex-col h-full w-20 glass border-r border-white/5 items-center py-10 gap-8 z-[100] shrink-0">
      <div className="mb-4 shrink-0"><SapfireLogo size={40} animated={true} /></div>
      {tabs.map((tab) => (
        <button key={tab.id} onClick={() => onNavigate(tab.id)} className={`group relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 shrink-0 ${currentView === tab.id ? 'bg-[var(--accent-primary)] text-white active-glow scale-110' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} title={tab.label}>
          <i className={`fas ${tab.icon} text-lg shrink-0 w-6 h-6 flex items-center justify-center`}></i>
          <span className="absolute left-16 px-3 py-1 bg-black text-[10px] font-black uppercase tracking-widest text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 z-50">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

const BottomBar = ({ currentView, onNavigate, visible }: { currentView: ViewType, onNavigate: (v: ViewType) => void, visible: boolean }) => {
  const { t } = useSettings();
  const tabs = [
    { id: ViewType.CHAT, icon: 'fa-comment-dots', label: t('Chats') },
    { id: ViewType.LIVE, icon: 'fa-tower-broadcast', label: t('Live') },
    { id: ViewType.CREATOR, icon: 'fa-wand-magic-sparkles', label: 'Lab' },
    { id: ViewType.STORE, icon: 'fa-shopping-cart', label: 'Store' },
    { id: ViewType.WALLET, icon: 'fa-wallet', label: t('Wallet') },
    { id: ViewType.SETTINGS, icon: 'fa-gear', label: t('Settings') },
  ];
  const activeIdx = tabs.findIndex(t => t.id === currentView);
  return (
    <nav className={`md:hidden fixed bottom-0 inset-x-0 z-[100] pb-6 px-4 pointer-events-none transition-all duration-500 ease-in-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
      <div className="max-w-xl mx-auto glass rounded-[2.5rem] p-2 flex items-center justify-between shadow-2xl pointer-events-auto relative overflow-hidden">
        <div className="absolute h-12 w-[16.6%] nav-blob rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" style={{ left: `calc(${activeIdx * 16.6}% + 0%)` }} />
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => onNavigate(tab.id)} className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-300 shrink-0 min-w-0 ${currentView === tab.id ? 'scale-110' : 'opacity-40 hover:opacity-80'}`}>
            <i className={`fas ${tab.icon} text-lg shrink-0 w-6 h-6 flex items-center justify-center ${currentView === tab.id ? 'text-white active-glow' : 'text-slate-400'}`}></i>
            <span className={`text-[8px] font-black uppercase tracking-widest truncate w-full text-center ${currentView === tab.id ? 'text-white' : 'text-slate-500'}`}>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="glass px-6 py-3 rounded-2xl border border-green-500/20 bg-black/60 shadow-2xl flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-black text-xs shrink-0 aspect-square"><i className="fas fa-check"></i></div>
        <span className="text-sm font-bold text-white whitespace-nowrap">{message}</span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { settings, updateSetting } = useSettings();
  
  const [user, setUser] = useState<AppUser>(() => {
    const savedMood = localStorage.getItem('sapfire_mood');
    const savedBalance = localStorage.getItem('sapfire_balance');
    const savedInventory = localStorage.getItem('sapfire_inventory');
    const savedActiveBG = localStorage.getItem('sapfire_active_bg');
    const savedActiveFrame = localStorage.getItem('sapfire_active_frame');
    return { 
      id: 'me', name: 'Sapfire User', username: 'sapfire_me', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sapfire_me', bio: 'Digital Nomad', phone: '+79991234567',
      balance: savedBalance ? parseInt(savedBalance) : 50000, 
      level: 12, settings: settings,
      mood: savedMood ? JSON.parse(savedMood) : undefined,
      inventory: savedInventory ? JSON.parse(savedInventory) : [],
      activeBackground: savedActiveBG || undefined,
      activeFrame: savedActiveFrame || undefined
    } as any;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('sapfire_contacts');
    try {
      return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
    } catch (e) {
      console.error("Corrupted contacts in localStorage", e);
      return DEFAULT_CONTACTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('sapfire_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('sapfire_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('sapfire_balance', user.balance.toString()); }, [user.balance]);
  useEffect(() => { localStorage.setItem('sapfire_inventory', JSON.stringify(user.inventory)); }, [user.inventory]);
  useEffect(() => { localStorage.setItem('sapfire_contacts', JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { 
    if (user.activeBackground) localStorage.setItem('sapfire_active_bg', user.activeBackground);
    else localStorage.removeItem('sapfire_active_bg');
    if (user.activeFrame) localStorage.setItem('sapfire_active_frame', user.activeFrame);
    else localStorage.removeItem('sapfire_active_frame');
  }, [user.activeBackground, user.activeFrame]);

  useEffect(() => { setUser(prev => ({ ...prev, settings })); }, [settings]);
  useEffect(() => { 
    if (user.mood) localStorage.setItem('sapfire_mood', JSON.stringify(user.mood));
    else localStorage.removeItem('sapfire_mood');
  }, [user.mood]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [bootText, setBootText] = useState('СИСТЕМА ГОТОВА');
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.CHAT);
  const [activeContactId, setActiveContactId] = useState<string>('c1');
  const [settingsMode, setSettingsMode] = useState<'main' | 'edit'>('main'); 
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);
  const [createCommunityInitialType, setCreateCommunityInitialType] = useState<ContactType>('group');

  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [mobileMode, setMobileMode] = useState<'list' | 'detail'>('list');
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [isKeySelected, setIsKeySelected] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsKeySelected(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleOpenSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setIsKeySelected(true);
    }
  };

  const handleTransfer = useCallback((contactId: string, amount: number, comment?: string) => {
    if (user.balance < amount) {
      setToastMessage('Недостаточно SAP на балансе');
      return false;
    }
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return false;

    const newTx: Transaction = {
      id: Date.now().toString(),
      type: 'out',
      label: `Перевод: ${contact.name}`,
      user: contact.name,
      amount: amount,
      date: Date.now(),
      contactId: contactId
    };

    setTransactions(prev => [newTx, ...prev]);
    setUser(prev => ({ ...prev, balance: prev.balance - amount }));
    setToastMessage(`Успешно отправлено ${amount} SAP`);

    const transferMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `💰 Перевод: ${amount} SAP.${comment ? ` Сообщение: ${comment}` : ''}`,
      timestamp: Date.now(),
      isTransfer: true,
      transferAmount: amount,
      senderName: user.name,
      senderColor: '#3b82f6'
    };
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, messages: [...c.messages, transferMsg] } : c));
    return true;
  }, [user.balance, contacts, user.name]);

  const handleGift = (amount: number, label: string) => {
    if (user.balance < amount) {
      setToastMessage('Недостаточно SAP для подарка');
      return false;
    }
    setUser(prev => ({ ...prev, balance: prev.balance - amount }));
    setTransactions(prev => [{
      id: Date.now().toString(),
      type: 'out',
      label: `Подарок: ${label}`,
      user: 'Live Platform',
      amount: amount,
      date: Date.now()
    }, ...prev]);
    return true;
  };

  const handleCreateCommunity = (data: { name: string, description: string, type: ContactType, participantIds: string[] }) => {
    const newId = `com-${Date.now()}`;
    const newCommunity: Contact = {
      id: newId,
      type: data.type,
      name: data.name,
      username: data.name.toLowerCase().replace(/\s+/g, '_'),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
      status: 'online',
      bio: data.description || `Official ${data.type} of ${data.name}.`,
      location: 'Ether',
      website: '',
      phone: '',
      ownerId: user.id,
      participantIds: data.participantIds,
      messages: [
        { 
          id: `sys-${Date.now()}`, 
          role: 'system', 
          content: data.type === 'group' ? `Вы создали группу "${data.name}"` : `Вы создали канал "${data.name}"`, 
          timestamp: Date.now() 
        }
      ]
    };

    setContacts(prev => [newCommunity, ...prev]);
    setActiveContactId(newId);
    setCurrentView(ViewType.CHAT);
    setMobileMode('detail');
    setToastMessage(`${data.type === 'group' ? 'Группа' : 'Канал'} успешно создана`);
  };

  const handlePurchase = (item: ShopItem) => {
    if (user.inventory.includes(item.id)) {
      if (item.category === 'background') {
        setUser(prev => ({ ...prev, activeBackground: prev.activeBackground === item.id ? undefined : item.id }));
        setToastMessage(user.activeBackground === item.id ? 'Фон деактивирован' : 'Фон активирован');
      } else if (item.category === 'frame') {
        setUser(prev => ({ ...prev, activeFrame: prev.activeFrame === item.id ? undefined : item.id }));
        setToastMessage(user.activeFrame === item.id ? 'Рамка деактивирована' : 'Рамка активирована');
      }
      return;
    }

    if (user.balance < item.price) {
      setToastMessage('Недостаточно SAP в Банке. Заработайте SAP в общении!');
      return;
    }

    const newTx: Transaction = {
      id: Date.now().toString(),
      type: 'out',
      label: `Покупка: ${item.name}`,
      user: 'SAP Store',
      amount: item.price,
      date: Date.now()
    };

    setTransactions(prev => [newTx, ...prev]);
    setUser(prev => ({
      ...prev,
      balance: prev.balance - item.price,
      inventory: [...prev.inventory, item.id],
      activeBackground: item.category === 'background' ? item.id : prev.activeBackground,
      activeFrame: item.category === 'frame' ? item.id : prev.activeFrame
    }));
    setToastMessage('Поздравляем! Товар успешно приобретен и активирован');
  };

  const handleAuth = () => {
    setIsConnecting(true);
    const steps = ["ИНТЕГРАЦИЯ ЯДРА...", "ПРОВЕРКА МОДУЛЕЙ...", "СИНХРОНИЗАЦИЯ ПОТОКОВ...", "ДОСТУП РАЗРЕШЕН"];
    steps.forEach((text, i) => { setTimeout(() => setBootText(text), i * 500); });
    setTimeout(() => { setIsLoggedIn(true); setIsConnecting(false); }, 2500);
  };

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
    setSettingsMode('main'); 
    if (view === ViewType.CHAT) setMobileMode('list'); else setMobileMode('detail');
  };

  const handleSimulateCall = (contact: Contact) => {
    setToastMessage(`Инициализация защищенного вызова: ${contact.name}...`);
  };

  const activeContact = contacts.find(c => c.id === activeContactId) || contacts[0] || DEFAULT_CONTACTS[0];
  const isBottomBarVisible = !(currentView === ViewType.CHAT && mobileMode === 'detail');

  if (!isLoggedIn) return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-1000">
      <div className="mesh-gradient"></div>
      <AuthView onLogin={handleAuth} isConnecting={isConnecting} bootText={bootText} />
    </div>
  );

  return (
    <div className="flex h-full w-full bg-[var(--bg-base)] overflow-hidden theme-transition relative animate-in fade-in duration-1000">
      <div className="mesh-gradient"></div>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      
      {!isKeySelected && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="max-w-md w-full glass p-10 rounded-[3rem] border border-white/10 text-center space-y-8 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
            <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20 active-glow">
              <i className="fas fa-key text-4xl text-blue-500"></i>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Требуется Ключ</h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Для работы с Omni-Studio и AI-модулями необходимо выбрать активный API ключ. Это обеспечит стабильное соединение и доступ к нейронным сетям.
              </p>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-widest text-left">
                <i className="fas fa-info-circle mr-2 text-blue-500"></i>
                Убедитесь, что вы выбрали ключ из платного проекта Google Cloud.
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-blue-400 underline ml-1">Подробнее</a>
              </div>
            </div>
            <button 
              onClick={handleOpenSelectKey}
              className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-500 hover:text-white transition-all shadow-2xl active:scale-95"
            >
              Выбрать API Ключ
            </button>
          </div>
        </div>
      )}

      <div className="flex w-full h-full relative z-10 overflow-hidden">
        <DesktopNav currentView={currentView} onNavigate={handleNavigate} />
        <div className={`${mobileMode === 'list' ? 'flex' : 'hidden'} md:flex h-full shrink-0 w-full md:w-[var(--sidebar-width)] border-r border-white/5`}>
          <Sidebar 
            currentView={currentView} 
            onNavigate={handleNavigate} 
            contacts={contacts} 
            stories={INITIAL_STORIES} 
            onStoryClick={setActiveStoryId} 
            activeContactId={activeContactId} 
            onContactSelect={(id) => { setActiveContactId(id); setMobileMode('detail'); setCurrentView(ViewType.CHAT); }} 
            user={user} 
            onMyProfile={() => { setViewingProfileId('me'); setMobileMode('detail'); }}
            onOpenCreateCommunity={(type) => { setCreateCommunityInitialType(type); setIsCreateCommunityOpen(true); }}
          />
        </div>
        <main className={`${mobileMode === 'detail' ? 'flex' : 'hidden'} md:flex flex-1 flex-col relative bg-black/20 backdrop-blur-sm min-w-0 h-full overflow-hidden`}>
          {currentView !== ViewType.SETTINGS || settingsMode === 'main' ? (
            <Header 
              activeContact={activeContact} 
              currentView={currentView} 
              onBack={() => setMobileMode('list')} 
              onOpenProfile={setViewingProfileId} 
              isDetailMode={mobileMode === 'detail'}
              onCallClick={() => handleSimulateCall(activeContact)}
            />
          ) : null}
          <div className="flex-1 relative overflow-hidden">
            {currentView === ViewType.CHAT && <ChatView contact={activeContact} user={user} onMessagesUpdate={(msgs) => setContacts(prev => prev.map(c => c.id === activeContactId ? {...c, messages: msgs} : c))} isBottomBarVisible={isBottomBarVisible} onTransfer={handleTransfer} />}
            {currentView === ViewType.WALLET && <div className="h-full pb-28 md:pb-0"><WalletView user={user} transactions={transactions} contacts={contacts} onTransfer={handleTransfer} /></div>}
            {currentView === ViewType.STORE && <div className="h-full pb-28 md:pb-0"><StoreView user={user} onPurchase={handlePurchase} /></div>}
            {currentView === ViewType.LIVE && <div className="h-full pb-28 md:pb-0"><LiveView user={user} streams={INITIAL_STREAMS} onGift={handleGift} /></div>}
            {currentView === ViewType.CREATOR && <div className="h-full pb-28 md:pb-0"><CreatorView streams={INITIAL_STREAMS} /></div>}
            {currentView === ViewType.SETTINGS && <div className="h-full pb-28 md:pb-0">{settingsMode === 'edit' ? <EditProfileView user={user} onSave={(data) => { setUser(prev => ({...prev, ...data})); setSettingsMode('main'); setToastMessage('Обновлено'); }} onBack={() => setSettingsMode('main')} /> : <SettingsView user={user} contacts={contacts} onUpdateSetting={updateSetting} onNavigateToEditProfile={() => setSettingsMode('edit')} onLogout={() => setIsLoggedIn(false)} onShowToast={(msg) => setToastMessage(msg)} />}</div>}
          </div>
        </main>
      </div>
      <BottomBar currentView={currentView} onNavigate={handleNavigate} visible={isBottomBarVisible} />
      {activeStoryId && <StoryViewer stories={INITIAL_STORIES} activeId={activeStoryId} onClose={() => setActiveStoryId(null)} />}
      {viewingProfileId && (
        <ProfileView 
          profileUser={viewingProfileId === 'me' ? user : (contacts.find(c => c.id === viewingProfileId) || DEFAULT_CONTACTS[0])} 
          isMe={viewingProfileId === 'me'} 
          onClose={() => setViewingProfileId(null)} 
          user={user} 
        />
      )}
      
      <CreateCommunityModal 
        isOpen={isCreateCommunityOpen} 
        onClose={() => setIsCreateCommunityOpen(false)} 
        contacts={contacts} 
        onCreate={handleCreateCommunity}
        initialType={createCommunityInitialType}
      />
    </div>
  );
};

export default App;
