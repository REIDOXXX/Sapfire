
import React, { useState } from 'react';
import { SapfireLogo } from './Logo';

interface AuthViewProps {
  onLogin: () => void;
  isConnecting: boolean;
  bootText: string;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'faceid';

const AuthView: React.FC<AuthViewProps> = ({ onLogin, isConnecting, bootText }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const startFaceScan = () => {
    setMode('faceid');
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => onLogin(), 600);
          return 100;
        }
        return p + 4;
      });
    }, 70);
  };

  const renderFaceId = () => (
    <div className="flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-500 py-6">
      <div className="w-48 h-48 rounded-full border-2 border-blue-500/20 relative flex items-center justify-center overflow-hidden bg-blue-500/5">
        <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
        <i className="fas fa-face-viewfinder text-6xl text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"></i>
        <div className="absolute inset-x-0 h-0.5 bg-blue-400 shadow-[0_0_10px_#60a5fa] animate-[scan_2s_linear_infinite]" style={{ top: '0%' }}></div>
      </div>
      <div className="w-full space-y-2 max-w-xs">
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Идентификация...</span>
          <span>{scanProgress}%</span>
        </div>
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${scanProgress}%` }}></div>
        </div>
      </div>
      <button onClick={() => setMode('login')} className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-wider mt-4">Отмена</button>
    </div>
  );

  const renderForm = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 mb-6">
        <button 
          onClick={() => setMode('login')} 
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${mode === 'login' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Вход
        </button>
        <button 
          onClick={() => setMode('register')} 
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${mode === 'register' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Регистрация
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 flex justify-center text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <i className="fas fa-envelope"></i>
          </div>
          <input 
            type="text" 
            placeholder="Email или Логин" 
            className="w-full h-12 bg-[#0a0a0a] border border-white/10 rounded-xl pl-11 pr-4 text-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 font-medium" 
          />
        </div>
        
        <div className="space-y-2">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 flex justify-center text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <i className="fas fa-lock"></i>
            </div>
            <input 
              type="password" 
              placeholder="Пароль" 
              className="w-full h-12 bg-[#0a0a0a] border border-white/10 rounded-xl pl-11 pr-4 text-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 font-medium" 
            />
          </div>
          
          {mode === 'login' && (
            <div className="flex justify-between items-center px-1">
              <button onClick={startFaceScan} className="text-[11px] font-bold text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1.5 group">
                <i className="fas fa-face-viewfinder group-hover:scale-110 transition-transform"></i> Face ID
              </button>
              <button onClick={() => setMode('forgot')} className="text-[11px] font-bold text-slate-500 hover:text-white transition-colors">
                Забыли пароль?
              </button>
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={onLogin} 
        disabled={isConnecting} 
        className="w-full h-12 mt-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:from-blue-500 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-900/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isConnecting ? (
          <>
            <i className="fas fa-circle-notch animate-spin text-sm"></i>
            <span>{bootText === 'СИСТЕМА ГОТОВА' ? 'ВХОД...' : bootText}</span>
          </>
        ) : (
          <span>{mode === 'login' ? 'Войти в систему' : 'Создать аккаунт'}</span>
        )}
      </button>

      {mode === 'register' && (
        <p className="text-center text-[10px] text-slate-500 leading-relaxed px-4">
          Нажимая кнопку, вы соглашаетесь с <span className="text-slate-400 hover:text-white cursor-pointer underline decoration-slate-600 underline-offset-2">Условиями использования</span> Sapfire Core.
        </p>
      )}
    </div>
  );

  const renderForgot = () => (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300 py-4">
      <div className="text-center space-y-2 mb-6">
        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-500 mb-4">
            <i className="fas fa-key text-xl"></i>
        </div>
        <h3 className="text-lg font-bold text-white">Восстановление доступа</h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-[260px] mx-auto">
          Введите email, привязанный к аккаунту, для сброса ключа доступа.
        </p>
      </div>
      
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 flex justify-center text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <i className="fas fa-at"></i>
        </div>
        <input 
          type="email" 
          placeholder="Email адрес" 
          className="w-full h-12 bg-[#0a0a0a] border border-white/10 rounded-xl pl-11 pr-4 text-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 font-medium" 
        />
      </div>

      <div className="space-y-3">
        <button className="w-full h-12 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-all shadow-lg active:scale-[0.98]">
          Отправить код
        </button>
        <button onClick={() => setMode('login')} className="w-full py-3 text-xs font-bold text-slate-500 hover:text-white transition-colors">
          Вернуться назад
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[400px] z-10 space-y-8">
      <header className="flex flex-col items-center space-y-6">
        <div className="cursor-pointer">
          <SapfireLogo size={mode === 'faceid' ? 80 : 100} animated={true} />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">Sapfire</h1>
          <p className="text-[10px] font-bold tracking-[0.4em] text-blue-500 uppercase">
            Безопасное пространство
          </p>
        </div>
      </header>

      <div className="glass rounded-[2rem] p-8 shadow-2xl relative overflow-hidden border border-white/10 bg-[#050505]/60 backdrop-blur-xl">
        {mode === 'faceid' ? renderFaceId() : mode === 'forgot' ? renderForgot() : renderForm()}
      </div>

      <footer className="text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
          v5.0.2 Стабильная • Зашифровано
        </p>
      </footer>
    </div>
  );
};

export default AuthView;
