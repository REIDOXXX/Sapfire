
import React, { useState, useCallback, useRef } from 'react';
import { AppUser, Transaction, Contact } from '../types';
import { useSettings } from '../context/SettingsContext';

interface WalletViewProps {
  user: AppUser;
  transactions: Transaction[];
  contacts: Contact[];
  onTransfer: (contactId: string, amount: number, comment?: string) => boolean;
}

const WalletView: React.FC<WalletViewProps> = ({ user, transactions, contacts, onTransfer }) => {
  const { settings } = useSettings();
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [recipientId, setRecipientId] = useState(contacts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  const playSuccessSound = useCallback(() => {
    if (!settings.notifSound) return;
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(1500, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.stop(now + 0.3);
  }, [settings.notifSound, getAudioCtx]);

  const handleExecuteTransfer = () => {
    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > user.balance) return;
    
    if (onTransfer(recipientId, numAmount, comment)) {
      playSuccessSound();
      setShowTransferModal(false);
      setAmount('');
      setComment('');
    }
  };

  const isValid = parseInt(amount) > 0 && parseInt(amount) <= user.balance && recipientId !== '';

  return (
    <div className="h-full overflow-y-auto p-6 md:p-12 custom-scrollbar animate-in fade-in relative">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Main Card */}
        <div className="relative overflow-hidden p-8 md:p-12 rounded-[3rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-20">
            <i className="fas fa-shield-halved text-8xl"></i>
          </div>
          <div className="relative z-10 space-y-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Общий баланс</p>
              <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter">
                {user.balance.toLocaleString()} <span className="text-2xl md:text-3xl not-italic text-[var(--accent-primary)]">SAP</span>
              </h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[var(--accent-primary)] hover:text-white transition-all">Пополнить</button>
              <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">Вывести</button>
              <button className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all">
                <i className="fas fa-qrcode"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Transfer Button */}
        <div className="px-4">
           <button 
             onClick={() => setShowTransferModal(true)}
             className="w-full py-6 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-3xl text-white font-black uppercase tracking-[0.3em] text-xs shadow-2xl active-glow flex items-center justify-center gap-4 hover:scale-[1.02] transition-all"
           >
             <i className="fas fa-paper-plane"></i>
             Перевести SAP
           </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Активы SAP', value: `${(user.balance / 1000).toFixed(1)}k`, icon: 'fa-coins', color: 'blue' },
            { label: 'NFT Активы', value: '12', icon: 'fa-gem', color: 'purple' },
            { label: 'Стейкинг', value: '8.4%', icon: 'fa-chart-line', color: 'emerald' }
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500`}>
                  <i className={`fas ${stat.icon}`}></i>
                </div>
                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">+12%</span>
              </div>
              <div>
                <h4 className="text-2xl font-black text-white">{stat.value}</h4>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Transaction History */}
        <div className="space-y-6">
          <div className="flex justify-between items-end px-4">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">История транзакций</h3>
            <button className="text-[9px] font-black text-[var(--accent-primary)] uppercase tracking-widest">Все операции</button>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden">
            {transactions.length > 0 ? transactions.map((tx, i) => (
              <div key={tx.id} className="flex items-center gap-4 p-6 border-b border-white/5 last:border-none hover:bg-white/[0.02] transition-colors">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'in' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  <i className={`fas ${tx.type === 'in' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-white uppercase tracking-wide">{tx.label}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{tx.user} • {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-right">
                  <h4 className={`text-sm font-black italic ${tx.type === 'in' ? 'text-green-500' : 'text-slate-200'}`}>
                    {tx.type === 'in' ? '+' : '-'}{tx.amount.toLocaleString()} SAP
                  </h4>
                  <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Успешно</p>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center opacity-30 flex flex-col items-center gap-4">
                <i className="fas fa-receipt text-4xl"></i>
                <p className="text-[10px] font-black uppercase tracking-widest">Транзакции не найдены</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6" onClick={() => setShowTransferModal(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"></div>
          <div className="relative glass p-8 rounded-[3rem] w-full max-w-md border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-wider">Новый перевод</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Отправка цифровых активов</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--accent-primary)] border border-white/10">
                   <i className="fas fa-exchange-alt text-xl"></i>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Получатель</label>
                  <select 
                    value={recipientId} 
                    onChange={e => setRecipientId(e.target.value)}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white text-sm font-bold outline-none focus:border-[var(--accent-primary)]/50 appearance-none transition-all"
                  >
                    {contacts.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#050505] text-white">
                        {c.name} (@{c.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Сумма SAP</label>
                  <div className="relative group">
                    <input 
                      type="number" 
                      value={amount} 
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00" 
                      className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl pl-6 pr-16 text-2xl font-black text-white outline-none focus:border-[var(--accent-primary)]/50 transition-all" 
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--accent-primary)] font-black text-sm">SAP</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-600 px-2 flex justify-between">
                    <span>Доступно: {user.balance.toLocaleString()} SAP</span>
                    {parseInt(amount) > user.balance && <span className="text-red-500 animate-pulse">Лимит превышен!</span>}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Комментарий</label>
                  <textarea 
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="На что эти деньги? (опционально)" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white font-medium outline-none focus:border-[var(--accent-primary)]/50 transition-all resize-none h-24"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowTransferModal(false)} 
                  className="flex-1 py-4 glass text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Отмена
                </button>
                <button 
                  onClick={handleExecuteTransfer}
                  disabled={!isValid}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${isValid ? 'bg-white text-black hover:bg-[var(--accent-primary)] hover:text-white' : 'bg-white/5 text-slate-700 cursor-not-allowed border border-white/5'}`}
                >
                  {isValid ? 'Подтвердить' : 'Недостаточно'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletView;
