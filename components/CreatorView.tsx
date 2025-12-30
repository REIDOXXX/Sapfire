
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { LiveStream } from '../types';

interface CreatorViewProps {
  streams: LiveStream[];
}

type Mode = 'shorts' | 'article' | 'editor';

const CreatorView: React.FC<CreatorViewProps> = ({ streams }) => {
  const [activeMode, setActiveMode] = useState<Mode>('shorts');
  const [selectedStreamId, setSelectedStreamId] = useState(streams[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleProcess = async () => {
    setIsProcessing(true);
    setResult(null);

    const stream = streams.find(s => s.id === selectedStreamId);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    let prompt = "";
    if (activeMode === 'shorts') {
      prompt = `Проанализируй это видео: "${stream?.title}" от хоста "${stream?.hostName}". Найди 3–5 самых захватывающих, смешных или информативных моментов, которые подойдут для формата TikTok/Shorts.
      Для каждого сегмента сделай следующее:
      1. Укажи таймкоды (начало и конец).
      2. Напиши цепляющий заголовок (hook), который можно вынести на экран.
      3. Составь краткое описание (caption) с релевантными хештегами.
      4. Объясни, почему этот момент будет виральным.
      Тон повествования: энергичный и виральный.`;
    } else if (activeMode === 'article') {
      prompt = `Посмотри запись этого лайв-стрима: "${stream?.title}" и преврати его в структурированную статью.
      Требования:
      - Составь краткое саммари: о чем был эфир?
      - Выдели основные тезисы и ключевые идеи (bullet points).
      - Выпиши 3 сильные цитаты из видео.
      - Оформи текст так, чтобы его было удобно читать: используй подзаголовки и списки.
      - В конце добавь раздел 'Action Items' (советы или действия для зрителей на основе услышанного).`;
    } else if (activeMode === 'editor') {
      prompt = `Ты — профессиональный видеоредактор. Твоя задача — помочь мне переделать этот исходный материал: "${stream?.title}" в динамичный ролик для YouTube.
      Структура: Предложи план монтажа (Intro -> Кульминация -> Outro).
      Динамика: Укажи моменты, где нужно вырезать паузы или скучные рассуждения.
      Визуал: Посоветуй, в каких местах стоит добавить текст на экран, мемы или футажи для удержания внимания.
      Звук: Предложи, какую фоновую музыку (по настроению) стоит наложить на разные части видео.`;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });
      setResult(response.text || "Ошибка генерации.");
    } catch (e) {
      console.error(e);
      setResult("Произошел сбой в нейросети Sapfire. Попробуйте позже.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-12 custom-scrollbar animate-in fade-in bg-black/20">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="text-center space-y-4">
           <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center mx-auto text-3xl text-white shadow-2xl animate-pulse">
              <i className="fas fa-wand-magic-sparkles"></i>
           </div>
           <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Creator Lab</h2>
           <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Нейронная переработка контента Sapfire</p>
        </header>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1.5 glass rounded-[2rem] border border-white/10">
           {(['shorts', 'article', 'editor'] as Mode[]).map(mode => (
             <button
               key={mode}
               onClick={() => setActiveMode(mode)}
               className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMode === mode ? 'bg-white text-black shadow-lg scale-105' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
             >
               {mode === 'shorts' ? 'Shorts / Reels' : mode === 'article' ? 'Статья / Пост' : 'Монтажный план'}
             </button>
           ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
           <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Источник контента</label>
                 <select
                    value={selectedStreamId}
                    onChange={(e) => setSelectedStreamId(e.target.value)}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white text-sm font-bold outline-none focus:border-[var(--accent-primary)] appearance-none transition-all"
                 >
                    {streams.map(s => (
                      <option key={s.id} value={s.id} className="bg-black text-white">{s.title}</option>
                    ))}
                 </select>
              </div>

              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                 <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Параметры ИИ</h4>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                       <span>Глубина анализа</span>
                       <span className="text-[var(--accent-primary)]">Максимальная</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-[var(--accent-primary)] w-[85%]"></div>
                    </div>
                 </div>
                 <p className="text-[9px] text-slate-600 font-medium leading-relaxed italic">
                   "Sapfire Lab использует Gemini 3 Pro для глубокого семантического разбора аудиовизуального потока."
                 </p>
              </div>

              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl active-glow flex items-center justify-center gap-4 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <i className="fas fa-circle-notch animate-spin"></i>
                ) : (
                  <i className="fas fa-bolt"></i>
                )}
                Запустить процесс
              </button>
           </div>

           <div className="glass p-8 rounded-[2.5rem] border border-white/5 min-h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                 <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Результат обработки</h4>
                 {result && (
                   <button onClick={() => navigator.clipboard.writeText(result)} className="text-[9px] font-black text-blue-400 uppercase tracking-widest hover:text-white">Копировать</button>
                 )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                 {isProcessing ? (
                   <div className="h-full flex flex-col items-center justify-center space-y-6">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0s]"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Нейросеть изучает поток данных...</p>
                   </div>
                 ) : result ? (
                   <div className="text-sm text-slate-300 leading-relaxed font-medium whitespace-pre-wrap animate-in fade-in slide-in-from-top-2">
                      {result}
                   </div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4 text-center">
                      <i className="fas fa-brain text-5xl"></i>
                      <p className="text-xs font-bold uppercase tracking-widest max-w-[200px]">Выберите источник и запустите анализ</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorView;
