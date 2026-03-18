"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  confidence?: number;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Greeting. I am PARTH AI. How may I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [starterSuggestions] = useState([
    "Explain Quantum Mechanics",
    "Derive the Maxwell Equations",
    "Help me write a professional email",
    "Give me a deep dive on Black Holes"
  ]);

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSubmit = overrideInput || input;
    if (!textToSubmit.trim()) return;
    
    // Optimistic UI update
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: textToSubmit };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    // Simulate backend fetch
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg.content })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        confidence: data.confidence
      }]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="relative z-10 flex flex-col h-full w-full max-w-4xl mx-auto p-4 md:p-8 min-h-0">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[80%] p-4 rounded-2xl glass-panel 
              ${msg.role === 'user' ? 'bg-primary/20 border-primary/40 rounded-br-sm' : 'bg-surface border-surface-hover rounded-bl-sm'}
            `}>
              <div className="prose prose-invert max-w-none text-sm md:text-base leading-relaxed text-foreground prose-p:my-2 prose-headings:my-3 prose-li:my-1 prose-a:text-primary prose-strong:text-foreground">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    img: ({node, ...props}) => (
                      <img 
                        {...props} 
                        className="w-full max-w-2xl rounded-lg my-4 border border-primary/30 shadow-lg shadow-primary/10" 
                        alt={props.alt || "PARTH AI Visual Aid"} 
                        loading="lazy" 
                      />
                    )
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
              {msg.confidence && msg.role === 'assistant' && (
                <div className="mt-2 text-xs flex items-center text-primary/60">
                  <Activity size={12} className="mr-1" /> Truth Validation: {(msg.confidence * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="glass-panel p-4 rounded-2xl rounded-bl-sm flex space-x-2 items-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-75" />
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {!input && messages.length <= 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-4 shrink-0">
          {starterSuggestions.map((sug, idx) => (
            <button 
              key={idx}
              onClick={() => handleSend(sug)}
              className="px-4 py-2 text-sm rounded-full border border-primary/20 bg-surface/50 hover:bg-primary/20 text-foreground transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="glass-panel p-2 rounded-full flex items-center shrink-0">
        <button 
          onClick={startRecording}
          title="Click to speak"
          className={`p-3 transition-colors focus:outline-none ${isRecording ? 'text-red-500 animate-pulse' : 'text-primary/70 hover:text-primary'}`}
        >
          <Mic size={20} />
        </button>
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isRecording ? "Listening..." : "Message PARTH..."}
          className="flex-1 bg-transparent border-none text-foreground placeholder-foreground/50 focus:ring-0 px-4 focus:outline-none"
        />
        <button 
          onClick={() => handleSend()}
          disabled={!input.trim()}
          className="p-3 bg-primary/20 hover:bg-primary/40 text-primary border border-primary/30 rounded-full transition-all disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
