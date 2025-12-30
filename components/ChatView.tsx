
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Contact, Message, AppUser } from '../types';
import { GoogleGenAI } from '@google/genai';
import { useSettings } from '../context/SettingsContext';

interface ChatViewProps {
  contact: Contact;
  user: AppUser;
  onMessagesUpdate: (messages: Message[]) => void;
  isBottomBarVisible: boolean;
  onTransfer: (contactId: string, amount: number, comment?: string) => boolean;
}

const EMOJIS = ['❤️', '👍', '🔥', '😂', '😮', '🙏'];

const ReactionPanel = ({ onSelect, activeReactions = [] }: { onSelect: (emoji: string) => void, activeReactions?: string[] }) => (
  <div className="flex items-center gap-1 p-1.5 glass rounded-full border border-white/20 shadow-2xl animate-in zoom-in-75 duration-200">
    {EMOJIS.map(emoji => (
      <button
        key={emoji}
        onClick={(e) => { e.stopPropagation(); onSelect(emoji); }}
        className={`w-9 h-9 flex items-center justify-center rounded-full text-xl hover:scale-125 hover:bg-white/10 transition-all duration-200 ${activeReactions.includes(emoji) ? 'bg-white/20 scale-110' : ''}`}
      >
        {emoji}
      </button>
    ))}
  </div>
);

const ReactionBubble = ({ reactions, onRemove }: { reactions: string[], onRemove: (emoji: string) => void }) => {
  if (!reactions || reactions.length === 0) return null;
  const counts = reactions.reduce((acc, emoji) => {
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return (
    <div className="flex flex-wrap gap-1 mt-1.5 animate-in slide-in-from-top-1 duration-300">
      {Object.entries(counts).map(([emoji, count]) => (
        <button key={emoji} onClick={(e) => { e.stopPropagation(); onRemove(emoji); }} className="flex items-center gap-1 px-2 py-0.5 glass-light border border-white/10 rounded-full text-[10px] font-bold text-white hover:border-white/30 transition-all shadow-sm active:scale-90">
          <span>{emoji}</span> {count > 1 && <span>{count}</span>}
        </button>
      ))}
    </div>
  );
};

const ChatView: React.FC<ChatViewProps> = ({ contact, user, onMessagesUpdate, isBottomBarVisible, onTransfer }) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [longPressedMessageId, setLongPressedMessageId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { settings } = useSettings();
  const audioCtxRef = useRef<AudioContext | null>(null);

  const isOwner = contact.ownerId === user.id;
  const canPost = contact.type !== 'channel' || isOwner;

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  const playSound = useCallback((type: 'send' | 'receive' | 'reaction' | 'money') => {
    if (!settings.notifSound) return;
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    osc.start(now);
    if (type === 'send') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.stop(now + 0.15);
    } else if (type === 'receive') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(880, now); osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.1);
      gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.stop(now + 0.2);
    } else if (type === 'money') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); osc.frequency.exponentialRampToValueAtTime(1500, now + 0.1);
      gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.stop(now + 0.3);
    } else {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.stop(now + 0.1);
    }
  }, [settings.notifSound, getAudioCtx]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom('smooth'), 50);
    return () => clearTimeout(timer);
  }, [contact.messages, isTyping, scrollToBottom]);

  useEffect(() => {
    scrollToBottom('auto');
  }, [contact.id, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!canPost || !inputValue.trim()) return;
    playSound('send');
    setApiError(null);
    
    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: inputValue, 
      timestamp: Date.now(), 
      reactions: [],
      senderName: user.name,
      senderId: user.id,
      senderColor: '#3b82f6',
      views: 0
    };
    
    const updatedMessages = [...contact.messages, userMessage];
    onMessagesUpdate(updatedMessages);
    const originalInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      if (originalInput.toLowerCase().startsWith('/image ')) {
        const promptText = originalInput.slice(7).trim();
        if (!promptText) throw new Error("Image prompt cannot be empty.");

        const response = await ai.models.generateContent({ 
          model: 'gemini-2.5-flash-image', 
          contents: { parts: [{ text: promptText }] }, 
          config: { imageConfig: { aspectRatio: "1:1" } } 
        });
        
        let imageUrl = '';
        const candidate = response.candidates?.[0];
        if (candidate?.content?.parts) { 
          for (const part of candidate.content.parts) { 
            if (part.inlineData) { 
              imageUrl = `data:image/png;base64,${part.inlineData.data}`; 
              break; 
            } 
          } 
        }
        
        const modelMessage: Message = { 
          id: (Date.now() + 1).toString(), 
          role: 'model', 
          content: imageUrl ? `Generated: "${promptText}"` : 'Failed to materialize image.', 
          timestamp: Date.now(), 
          attachment: imageUrl ? { type: 'image', url: imageUrl } : undefined, 
          reactions: [], 
          senderName: contact.name, 
          senderColor: '#10b981', 
          views: 0 
        };
        onMessagesUpdate([...updatedMessages, modelMessage]);
        playSound('receive');
      } else {
        let filteredHistory = updatedMessages
          .filter(m => m.role !== 'system' && m.content.trim() !== '')
          .map(m => ({
            role: (m.role === 'admin' || m.role === 'model') ? 'model' : 'user',
            parts: [{ text: m.content }]
          }));

        if (filteredHistory.length > 0 && filteredHistory[0].role !== 'user') {
          filteredHistory = [{ role: 'user', parts: [{ text: 'Greetings' }] }, ...filteredHistory];
        }

        const sanitizedHistory: any[] = [];
        for (const msg of filteredHistory) {
          if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === msg.role) {
            sanitizedHistory[sanitizedHistory.length - 1].parts[0].text += `\n${msg.parts[0].text}`;
          } else {
            sanitizedHistory.push(msg);
          }
        }

        const response = await ai.models.generateContent({ 
          model: 'gemini-3-flash-preview', 
          contents: sanitizedHistory, 
          config: { 
            systemInstruction: `You are ${contact.name}, a core inhabitant of Sapfire. Bio: ${contact.bio}. Be ultra-futuristic, crisp, and insightful. Your replies should be concise and meaningful. Language: ${user.settings.language}.` 
          } 
        });
        
        const modelMessage: Message = { 
          id: (Date.now() + 1).toString(), 
          role: 'model', 
          content: response.text || 'Core sync error.', 
          timestamp: Date.now(), 
          reactions: [], 
          senderName: contact.name, 
          senderColor: '#ec4899', 
          views: 0 
        };
        onMessagesUpdate([...updatedMessages, modelMessage]);
        playSound('receive');
      }
    } catch (error: any) { 
      console.error('Gemini Error:', error); 
      if (error?.message?.includes('Requested entity was not found') && window.aistudio) {
        setApiError('API Key synchronization error. Please re-select your key.');
        window.aistudio.openSelectKey();
      } else {
        setApiError(error?.message || 'Connection lost in the pulse. Check your API key.');
      }
    } finally { 
      setIsTyping(false); 
    }
  };

  const handleToggleReaction = (messageId: string, emoji: string) => {
    const updatedMessages = contact.messages.map(msg => {
      if (msg.id === messageId) {
        const currentReactions = msg.reactions || [];
        const hasReaction = currentReactions.includes(emoji);
        return { ...msg, reactions: hasReaction ? currentReactions.filter(r => r !== emoji) : [...currentReactions, emoji] };
      }
      return msg;
    });
    onMessagesUpdate(updatedMessages);
    playSound('reaction');
    setLongPressedMessageId(null);
  };

  const handleTouchStart = (msgId: string) => { longPressTimer.current = setTimeout(() => { setLongPressedMessageId(msgId); if (window.navigator.vibrate) window.navigator.vibrate(50); }, 500); };
  const handleTouchEnd = () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); };

  const chatBgStyle = useMemo(() => {
    if (user.activeBackground === 'bg_cyber') return { backgroundImage: 'url("https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=1600&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 1 };
    if (user.activeBackground === 'bg_cosmos') return { backgroundImage: 'url("https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 1 };
    if (settings.moodThemeEnabled && user.mood) return { background: `radial-gradient(circle at center, ${user.mood.color}11 0%, transparent 70%)`, transition: 'background 0.5s ease' };
    return {};
  }, [settings.moodThemeEnabled, user.mood, user.activeBackground]);

  return (
    <div className="h-full w-full relative overflow-hidden flex flex-col" style={chatBgStyle} onClick={() => setLongPressedMessageId(null)}>
      {/* Background Decor */}
      {!user.activeBackground && settings.moodThemeEnabled && user.mood && <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: `radial-gradient(${user.mood.color} 1px, transparent 1px)`, backgroundSize: '30px 30px' }}></div>}
      {user.activeBackground && <div className="absolute inset-0 bg-black/60 pointer-events-none z-0"></div>}
      
      {/* MESSAGES AREA - Flex Grow 1 to push input down */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto px-4 md:px-10 custom-scrollbar relative z-10 flex flex-col pb-5"
      >
        <div className="flex-1 min-h-[10px]" /> {/* Push content to bottom */}
        <div className="space-y-8 w-full py-6">
            {contact.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'system' ? 'justify-center' : msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`} onMouseEnter={() => setHoveredMessageId(msg.id)} onMouseLeave={() => setHoveredMessageId(null)} onTouchStart={() => handleTouchStart(msg.id)} onTouchEnd={handleTouchEnd}>
                {msg.role === 'system' ? (
                <div className="glass px-6 py-2 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    {msg.content}
                </div>
                ) : (
                <div className={`max-w-[85%] md:max-w-[70%] group relative`}>
                    {contact.type !== 'direct' && msg.role !== 'user' && (
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1.5 ml-4" style={{ color: msg.senderColor || 'var(--accent-primary)' }}>
                        {typeof msg.senderName === 'string' ? msg.senderName : 'Member'}
                    </p>
                    )}

                    <div className={`absolute top-0 ${msg.role === 'user' ? '-left-12' : '-right-12'} opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex`}>
                    <button onClick={(e) => { e.stopPropagation(); setLongPressedMessageId(longPressedMessageId === msg.id ? null : msg.id); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-500 transition-all"><i className="far fa-face-smile"></i></button>
                    </div>

                    {longPressedMessageId === msg.id && <div className={`absolute z-[60] -top-16 ${msg.role === 'user' ? 'right-0' : 'left-0'}`}><ReactionPanel onSelect={(emoji) => handleToggleReaction(msg.id, emoji)} activeReactions={msg.reactions} /></div>}

                    <div className={`p-5 md:p-6 rounded-[2.5rem] relative ${msg.isTransfer ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-white shadow-xl' : msg.role === 'user' ? 'bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-tr-none shadow-xl active-glow' : 'glass text-slate-200 rounded-tl-none'}`}>
                    {msg.isTransfer && (
                        <div className="flex flex-col gap-4 mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black text-lg"><i className="fas fa-coins"></i></div>
                            <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Системный перевод</p>
                            <h4 className="text-xl font-black italic">{msg.transferAmount?.toLocaleString()} SAP</h4>
                            </div>
                        </div>
                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Посмотреть чек</button>
                        </div>
                    )}
                    {msg.attachment?.type === 'image' && <img src={msg.attachment.url} className="w-full rounded-2xl mb-4 border border-white/10 shrink-0 object-cover aspect-square" alt="Generated" />}
                    <p className="text-sm leading-relaxed tracking-tight break-words">{msg.content}</p>
                    
                    {contact.type === 'channel' && (
                        <div className="mt-3 flex items-center gap-2 opacity-40">
                        <i className="far fa-eye text-[10px]"></i>
                        <span className="text-[10px] font-bold">{Math.floor(Math.random() * 500) + 50}</span>
                        </div>
                    )}

                    <div className={`absolute -bottom-4 ${msg.role === 'user' ? 'right-4' : 'left-4'}`}><ReactionBubble reactions={msg.reactions || []} onRemove={(emoji) => handleToggleReaction(msg.id, emoji)} /></div>
                    </div>
                    <p className={`text-[9px] font-black uppercase tracking-widest text-slate-600 mt-5 ${msg.role === 'user' ? 'text-right mr-4' : 'text-left ml-4'}`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                )}
            </div>
            ))}

            {isTyping && <div className="flex justify-start"><div className="glass px-6 py-4 rounded-3xl rounded-tl-none flex gap-2"><div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:0.2s] jumping-dots"></div><div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:0.4s] jumping-dots"></div></div></div>}
            
            {apiError && (
            <div className="flex justify-center p-4">
                <div className="glass p-4 rounded-2xl border border-red-500/20 text-center space-y-2">
                <i className="fas fa-triangle-exclamation text-red-500"></i>
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-tight">{apiError}</p>
                <button onClick={() => setApiError(null)} className="text-[9px] font-bold text-slate-500 uppercase underline">Dismiss</button>
                </div>
            </div>
            )}

            <div ref={messagesEndRef} className="h-2 w-full shrink-0" />
        </div>
      </div>

      {/* INPUT AREA - Relative positioning to prevent overlaying messages */}
      <div 
        className={`w-full z-20 relative bg-[var(--bg-base)]/80 backdrop-blur-xl border-t border-white/5 transition-all duration-300 ${isBottomBarVisible ? 'pt-4 pb-4 md:pb-6' : 'pt-4 pb-6 md:pb-8'}`}
      >
        <div className="max-w-4xl mx-auto px-4 md:px-8 relative">
          {canPost ? (
            <div className="glass rounded-[2.5rem] p-1.5 flex items-center gap-2 border border-white/10 shadow-2xl bg-white/[0.04]">
              <button className="w-12 h-12 flex items-center justify-center rounded-full text-slate-500 hover:text-white transition-all"><i className="fas fa-paperclip"></i></button>
              <input 
                type="text" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                placeholder={isRecording ? "Listening..." : "Inject command..."} 
                className="flex-1 bg-transparent border-none outline-none text-white text-sm px-4 placeholder:text-slate-700 min-w-0 font-medium" 
                disabled={isRecording} 
              />
              <div className="flex items-center gap-1 shrink-0">
                {inputValue.trim().length > 0 ? (
                  <button onClick={handleSendMessage} className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black shadow-xl"><i className="fas fa-arrow-up"></i></button>
                ) : (
                  <button onClick={() => setIsRecording(!isRecording)} className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${isRecording ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-white/5 text-slate-500 hover:text-white'}`}><i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i></button>
                )}
              </div>
            </div>
          ) : (
            <div className="glass rounded-[2.5rem] p-5 flex items-center justify-center bg-white/[0.04] border border-white/10 shadow-xl">
               <div className="flex items-center gap-3 text-slate-500">
                  <i className="fas fa-lock text-xs"></i>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Вы подписаны на канал. Чтение разрешено.</span>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatView;
