
import React, { useState, useRef, useEffect } from 'react';
import { LiveStream, AppUser } from '../types';

interface LiveViewProps {
  user: AppUser;
  streams: LiveStream[];
  onGift: (amount: number, label: string) => boolean;
}

interface VideoPlayerProps {
  stream: LiveStream;
  isMuted: boolean;
  onToggleMute: () => void;
  fullHeight?: boolean;
  onLike: () => void;
  onGift: () => void;
  likesCount: number;
}

interface StreamMessage {
  id: string;
  user: string;
  text: string;
  type?: 'normal' | 'gift';
}

// Анимация монетки при донате
const GiftCoin = ({ id, onComplete }: { id: number, onComplete: (id: number) => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(id), 1000);
    return () => clearTimeout(timer);
  }, [id, onComplete]);

  return (
    <div className="absolute right-10 bottom-40 pointer-events-none animate-coin-burst text-3xl text-yellow-400 z-[150]">
      <i className="fas fa-coins drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]"></i>
    </div>
  );
};

// Анимация сердца
const HeartIcon = ({ id, onComplete }: { id: number, onComplete: (id: number) => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(id), 1200);
    return () => clearTimeout(timer);
  }, [id, onComplete]);

  return (
    <div className="absolute right-12 bottom-32 pointer-events-none animate-heart-fly text-2xl text-red-500 z-[150]">
      <i className="fas fa-heart"></i>
    </div>
  );
};

const FullScreenPlayer: React.FC<VideoPlayerProps> = ({ stream, isMuted, onToggleMute, onLike, onGift, likesCount }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) videoRef.current?.play().catch(() => {});
        else videoRef.current?.pause();
      },
      { threshold: 0.8 }
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full h-full snap-start snap-always bg-black flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        src="https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-neon-lights-at-night-40144-large.mp4"
        loop
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover"
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
          <div className="w-10 h-10 border-4 border-white/10 border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
        </div>
      )}

      {/* Overlay Content */}
      <div className="absolute inset-0 z-30 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none">
        <div className="absolute bottom-0 inset-x-0 p-8 flex justify-between items-end">
          <div className="flex-1 max-w-[70%] space-y-4 pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={stream.hostAvatar} className="w-12 h-12 rounded-2xl border-2 border-white/20" alt={stream.hostName} />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-sm font-black text-white italic tracking-wider">@{stream.hostName}</h3>
                <p className="text-[10px] text-[var(--accent-primary)] font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  LIVE • {stream.viewers}
                </p>
              </div>
              <button className="ml-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-black text-white uppercase tracking-widest border border-white/10 transition-all">Подписаться</button>
            </div>
            <p className="text-xs font-bold text-white/80 line-clamp-2 leading-relaxed">{stream.title}</p>
          </div>

          {/* RIGHT ACTION SIDEBAR - FIXED SPACING */}
          <div className="flex flex-col items-center gap-8 pointer-events-auto mb-10">
            <div className="flex flex-col items-center gap-2">
              <button onClick={onLike} className="w-14 h-14 rounded-full glass border border-white/10 flex items-center justify-center text-white text-xl active:scale-90 transition-all hover:bg-red-500/20 hover:text-red-500">
                <i className="fas fa-heart"></i>
              </button>
              <span className="text-[11px] font-black text-white tracking-widest drop-shadow-md">{likesCount.toLocaleString()}</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button onClick={onGift} className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center text-white text-2xl shadow-xl active:scale-90 transition-all border border-white/20">
                <i className="fas fa-gift"></i>
              </button>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Gift</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button className="w-14 h-14 rounded-full glass border border-white/10 flex items-center justify-center text-white text-xl hover:bg-white/10 transition-all">
                <i className="fas fa-share"></i>
              </button>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Share</span>
            </div>

            <button onClick={onToggleMute} className="w-10 h-10 rounded-full glass flex items-center justify-center text-white">
              <i className={`fas ${isMuted ? 'fa-volume-mute text-slate-500' : 'fa-volume-up text-blue-400'}`}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LiveView: React.FC<LiveViewProps> = ({ user, streams, onGift }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'streams' | 'clips'>('feed');
  const [isMuted, setIsMuted] = useState(true);
  const [coins, setCoins] = useState<{ id: number }[]>([]);
  const [hearts, setHearts] = useState<{ id: number }[]>([]);
  const [likes, setLikes] = useState(12400);

  const handleLike = () => {
    setLikes(prev => prev + 1);
    setHearts(prev => [...prev, { id: Math.random() }]);
  };

  const handleGiftClick = (hostName: string) => {
    if (onGift(50, hostName)) {
      for (let i = 0; i < 8; i++) {
        setTimeout(() => setCoins(prev => [...prev, { id: Math.random() }]), i * 100);
      }
    }
  };

  return (
    <div className="h-full w-full bg-[#030303] flex flex-col relative overflow-hidden">
      {/* Navigation Header */}
      <div className="absolute top-0 left-0 right-0 z-[150] p-6 pt-12 flex justify-center pointer-events-none">
        <div className="glass px-2 py-1.5 rounded-[2rem] border border-white/10 backdrop-blur-3xl flex gap-1 pointer-events-auto bg-black/40">
          {(['feed', 'streams', 'clips'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === tab ? 'bg-white text-black shadow-xl scale-105' : 'text-white/40 hover:text-white'}`}
            >
              {tab === 'feed' ? 'Для вас' : tab === 'streams' ? 'Эфир' : 'Клипы'}
            </button>
          ))}
        </div>
      </div>

      {/* FX Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[200]">
        {coins.map(c => <GiftCoin key={c.id} id={c.id} onComplete={(id) => setCoins(prev => prev.filter(x => x.id !== id))} />)}
        {hearts.map(h => <HeartIcon key={h.id} id={h.id} onComplete={(id) => setHearts(prev => prev.filter(x => x.id !== id))} />)}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'feed' ? (
          <div className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar scroll-smooth">
            {[...streams, ...streams].map((stream, idx) => (
              <FullScreenPlayer 
                key={`${stream.id}-${idx}`} 
                stream={stream} 
                isMuted={isMuted} 
                onToggleMute={() => setIsMuted(!isMuted)} 
                onLike={handleLike}
                onGift={() => handleGiftClick(stream.hostName)}
                likesCount={likes + idx * 10}
              />
            ))}
          </div>
        ) : activeTab === 'streams' ? (
          <div className="h-full overflow-y-auto custom-scrollbar p-6 pt-28 pb-32">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8 px-4">
                 <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Прямо сейчас</h2>
                 <div className="flex gap-2">
                    <span className="px-3 py-1 bg-red-600/20 text-red-500 rounded-lg text-[10px] font-black animate-pulse">● LIVE</span>
                    <span className="px-3 py-1 bg-white/5 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">42 Стрима</span>
                 </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {streams.map((stream, idx) => (
                  <div key={`${stream.id}-${idx}`} className="group relative aspect-[16/10] rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/5 cursor-pointer hover:border-[var(--accent-primary)]/50 transition-all hover:scale-[1.02]">
                    <img src={stream.previewUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" alt={stream.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4">
                       <span className="px-2 py-1 bg-red-600 rounded-lg text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                         <span className="w-1 h-1 bg-white rounded-full animate-ping"></span>
                         LIVE
                       </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                       <img src={stream.hostAvatar} className="w-8 h-8 rounded-xl border border-white/20" alt={stream.hostName} />
                       <div className="min-w-0">
                          <p className="text-[10px] font-black text-white truncate uppercase tracking-widest">{stream.hostName}</p>
                          <p className="text-[9px] text-slate-400 font-bold truncate line-clamp-1">{stream.title}</p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto custom-scrollbar p-6 pt-28 pb-32">
             <div className="max-w-6xl mx-auto">
                <div className="flex flex-col items-center text-center space-y-4 mb-12">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/20 text-indigo-500 flex items-center justify-center text-3xl border border-indigo-500/30">
                      <i className="fas fa-bolt"></i>
                   </div>
                   <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Лучшие моменты</h2>
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Самое популярное за 24 часа</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {[1,2,3,4,5,6,7,8].map(i => (
                     <div key={i} className="aspect-[9/16] rounded-3xl overflow-hidden bg-white/5 border border-white/10 group cursor-pointer hover:scale-[1.02] transition-all">
                        <img src={`https://picsum.photos/seed/${i + 50}/400/800`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" alt="Clip" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                           <div className="flex items-center gap-2 mb-1">
                              <i className="fas fa-play text-[8px] text-white"></i>
                              <span className="text-[9px] font-black text-white uppercase tracking-widest">{(Math.random() * 10).toFixed(1)}k views</span>
                           </div>
                           <p className="text-[10px] font-bold text-white line-clamp-2">Эпичный момент в Sapfire Studio {i}!</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes coin-burst {
          0% { transform: scale(0.5) translateY(0); opacity: 0; }
          20% { transform: scale(1.2) translateY(-20px); opacity: 1; }
          100% { transform: scale(0.8) translateY(-150px) translateX(-50px); opacity: 0; }
        }
        @keyframes heart-fly {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-300px) translateX(-30px) scale(2) rotate(-20deg); opacity: 0; }
        }
        .animate-coin-burst { animation: coin-burst 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-heart-fly { animation: heart-fly 1.2s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default LiveView;
