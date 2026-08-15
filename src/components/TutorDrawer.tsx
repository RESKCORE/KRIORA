import React, { useRef, useEffect } from 'react';
import { X, Sparkles, Send, Bot, User, Brain, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface TutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  lessonTitle: string;
  chatMessages: ChatMessage[];
  userInputMessage: string;
  setUserInputMessage: (msg: string) => void;
  onSendMessage: (e?: React.FormEvent) => void;
  isAiTyping: boolean;
}

export default function TutorDrawer({
  isOpen,
  onClose,
  courseTitle,
  lessonTitle,
  chatMessages,
  userInputMessage,
  setUserInputMessage,
  onSendMessage,
  isAiTyping
}: TutorDrawerProps) {
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAiTyping]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs font-sans">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col justify-between shadow-2xl relative overflow-hidden">
        
        {/* Dynamic Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/KRIORA_LOGO_2.png"
              alt="Kriora AI"
              className="w-8 h-8 rounded-full object-cover shadow-md shadow-orange-500/20 border border-orange-200 ring-2 ring-orange-500/20"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">Kriora AI Tutor</span>
                <span className="bg-[#FF5A36]/10 text-[#FF5A36] font-mono text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Gemini 3.5</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono truncate block max-w-[200px]">Active context: {lessonTitle || 'Dashboard'}</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Course Lesson Context Header Banner */}
        {lessonTitle && (
          <div className="px-4 py-2 bg-orange-50 border-b border-slate-200 text-[10px] flex items-center gap-1.5 text-orange-600 font-mono">
            <Brain className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Trained on {courseTitle} • {lessonTitle} notes</span>
          </div>
        )}

        {/* Chat Bubbles Queue */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {chatMessages.map(msg => {
            const isAi = msg.sender === 'ai';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Mini avatar */}
                <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${
                  isAi ? 'bg-[#FF5A36] text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {isAi ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                <div className="space-y-1">
                  <div className={`p-3 rounded-xl text-xs leading-relaxed font-sans border shadow ${
                    isAi 
                      ? 'bg-slate-50 border-slate-200 text-slate-700' 
                      : 'bg-[#FF5A36] border-[#FF5A36] text-white'
                  }`}>
                    {/* Render message formatting simply */}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[8px] font-mono text-slate-400 block text-right">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}

          {/* Typing Loading indicator */}
          {isAiTyping && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-7 h-7 rounded-lg bg-[#FF5A36] flex items-center justify-center text-white shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#FF5A36] rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-[#FF5A36] rounded-full animate-bounce delay-150"></span>
                <span className="w-1.5 h-1.5 bg-[#FF5A36] rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Tray Form */}
        <form 
          onSubmit={onSendMessage} 
          className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2"
        >
          <Input 
            type="text" 
            value={userInputMessage}
            onChange={(e) => setUserInputMessage(e.target.value)}
            placeholder="Ask about Istio, Cilium, routing rules..."
            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-[#FF5A36]"
            disabled={isAiTyping}
          />
          <Button 
            type="submit"
            disabled={isAiTyping || !userInputMessage.trim()}
            className="p-2 bg-[#FF5A36] hover:bg-orange-600 disabled:bg-slate-300 text-white rounded-lg shadow-md shadow-orange-500/25"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

      </div>
    </div>
  );
}
