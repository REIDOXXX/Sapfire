
import React, { useState, useEffect } from 'react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });
  const [showPass, setShowPass] = useState({
    current: false,
    newPass: false,
    confirm: false
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Clear state when opening
  useEffect(() => {
    if (isOpen) {
      setFormData({ current: '', newPass: '', confirm: '' });
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const toggleShow = (field: keyof typeof showPass) => {
    setShowPass(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.current || !formData.newPass || !formData.confirm) {
      setError('Все поля обязательны для заполнения');
      return;
    }
    if (formData.newPass.length < 6) {
      setError('Новый пароль должен содержать минимум 6 символов');
      return;
    }
    if (formData.newPass !== formData.confirm) {
      setError('Пароли не совпадают');
      return;
    }

    // Simulation
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
      onClose();
    }, 1000);
  };

  const renderInput = (
    name: keyof typeof formData, 
    placeholder: string, 
    label: string
  ) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 flex justify-center text-slate-400 group-focus-within:text-[var(--accent-primary)] transition-colors">
          <i className="fas fa-lock"></i>
        </div>
        <input 
          type={showPass[name] ? "text" : "password"}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full h-12 bg-[#0a0a0a] border ${error && name !== 'current' && formData[name].length > 0 && formData.newPass !== formData.confirm && name === 'confirm' ? 'border-red-500/50' : 'border-white/10'} rounded-xl pl-11 pr-12 text-white text-sm outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/50 transition-all placeholder:text-slate-600 font-medium`} 
        />
        <button 
          onClick={() => toggleShow(name)}
          className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
        >
          <i className={`fas ${showPass[name] ? 'fa-eye-slash' : 'fa-eye'}`}></i>
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#050505]/90 border border-white/10 rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header */}
        <div className="text-center mb-8 relative">
            <div className="w-16 h-16 bg-[var(--accent-primary)]/10 rounded-full flex items-center justify-center mx-auto text-[var(--accent-primary)] mb-4 border border-[var(--accent-primary)]/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <i className="fas fa-key text-2xl"></i>
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-wider">Смена пароля</h3>
            <button 
                onClick={onClose}
                className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
                <i className="fas fa-times"></i>
            </button>
        </div>

        {/* Form */}
        <div className="space-y-5">
            {renderInput('current', 'Введите текущий пароль', 'Текущий пароль')}
            {renderInput('newPass', 'Придумайте новый пароль', 'Новый пароль')}
            {renderInput('confirm', 'Повторите новый пароль', 'Подтверждение')}

            {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-in slide-in-from-top-2">
                    <i className="fas fa-circle-exclamation text-red-500 text-sm"></i>
                    <span className="text-xs font-bold text-red-400">{error}</span>
                </div>
            )}

            <button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-14 mt-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[var(--accent-primary)] hover:text-white transition-all shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <i className="fas fa-circle-notch animate-spin"></i>
                        <span>Обновление...</span>
                    </>
                ) : (
                    <span>Обновить пароль</span>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
