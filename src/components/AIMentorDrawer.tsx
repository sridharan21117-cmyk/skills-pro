import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User as UserIcon, Wifi, WifiOff, Calendar, Code, Brain, HelpCircle } from 'lucide-react';
import { aiService } from '../services/api';
import { User } from '../types';

interface AIMentorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  isOfflineAI: boolean;
  setIsOfflineAI: (val: boolean) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  mode?: string;
  time: string;
}

export const AIMentorDrawer: React.FC<AIMentorDrawerProps> = ({
  isOpen,
  onClose,
  user,
  isOfflineAI,
  setIsOfflineAI
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init_1',
      sender: 'ai',
      text: `Hello ${user?.name || 'Learner'}! I am **Skill Forge AI Mentor**. How can I assist with your courses, coding bugs, aptitude tricks, or career roadmap today?`,
      mode: isOfflineAI ? 'Offline Local AI' : 'Online Gemini AI',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (promptText?: string) => {
    const textToSend = promptText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!promptText) setInput('');
    setLoading(true);

    try {
      const res = await aiService.chat(textToSend, { user }, isOfflineAI);
      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        mode: res.mode,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'ai',
          text: `⚠️ Error fetching response: ${err.message || 'Offline mode fallback active.'}`,
          mode: 'Offline Local AI Fallback',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-slate-900/80 backdrop-blur-2xl border-l border-white/15 shadow-2xl flex flex-col">
      
      {/* Drawer Header */}
      <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-white">Skill Forge AI Mentor</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${
                isOfflineAI ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {isOfflineAI ? 'Offline AI' : 'Online AI'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">Powered by Gemini 2.5 & Local AI Engine</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mode Switcher Bar */}
      <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs text-slate-300 backdrop-blur-md">
        <span className="text-[11px] font-semibold text-slate-400">AI Execution Mode:</span>
        <button
          onClick={() => setIsOfflineAI(!isOfflineAI)}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition backdrop-blur-md ${
            isOfflineAI
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          }`}
        >
          {isOfflineAI ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
          <span>{isOfflineAI ? 'Offline Local AI' : 'Online Gemini AI'}</span>
        </button>
      </div>

      {/* Suggested Quick Actions */}
      <div className="p-3 bg-white/5 border-b border-white/10 flex items-center space-x-2 overflow-x-auto text-[11px] no-scrollbar backdrop-blur-md">
        <button
          onClick={() => handleSend('Tomorrow enna padikanum? Generate my personalized study plan')}
          className="px-2.5 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-indigo-400/40 text-indigo-200 rounded-xl font-medium whitespace-nowrap flex items-center space-x-1 transition backdrop-blur-sm"
        >
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>Study Plan</span>
        </button>
        <button
          onClick={() => handleSend('How do I optimize two-pointer array solutions in Python and C++?')}
          className="px-2.5 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-purple-400/40 text-indigo-200 rounded-xl font-medium whitespace-nowrap flex items-center space-x-1 transition backdrop-blur-sm"
        >
          <Code className="w-3.5 h-3.5 text-purple-400" />
          <span>Debug Code</span>
        </button>
        <button
          onClick={() => handleSend('Explain shortcut trick for remainder problems in Quantitative Aptitude')}
          className="px-2.5 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-pink-400/40 text-indigo-200 rounded-xl font-medium whitespace-nowrap flex items-center space-x-1 transition backdrop-blur-sm"
        >
          <Brain className="w-3.5 h-3.5 text-pink-400" />
          <span>Aptitude Trick</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed backdrop-blur-md shadow-lg ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none border border-white/20'
                  : 'bg-white/10 text-slate-100 border border-white/10 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
            <div className="flex items-center space-x-2 mt-1 px-1">
              <span className="text-[10px] text-slate-400">{msg.time}</span>
              {msg.mode && (
                <span className="text-[10px] text-slate-400 font-mono">({msg.mode})</span>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-xs text-indigo-300 p-2">
            <Bot className="w-4 h-4 animate-bounce" />
            <span>AI Mentor thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-3 bg-white/5 border-t border-white/10 backdrop-blur-md">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask AI Mentor anything..."
            className="flex-1 px-3.5 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-400/50 backdrop-blur-md placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-white/20 text-white rounded-xl disabled:opacity-50 transition shadow-lg backdrop-blur-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
