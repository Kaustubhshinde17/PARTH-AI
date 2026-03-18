"use client";
import React, { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import VoiceInterface from '@/components/VoiceInterface';
import Image from 'next/image';
import { MessageSquare, Mic } from 'lucide-react';

export default function Home() {
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  return (
    <main className="relative w-screen h-screen overflow-hidden flex flex-col bg-background">
      
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/bg-parth.png" 
          alt="PARTH AI Steady 3D Background" 
          fill 
          style={{ objectFit: 'cover' }}
          priority 
          className="opacity-40"
        />
        <div className="absolute inset-0 bg-background/60" /> {/* Dark overlay for readability */}
      </div>
      
      {/* Top Navigation / Header */}
      <header className="relative z-20 w-full p-6 flex justify-between items-center bg-gradient-to-b from-background to-transparent pointer-events-none">
        <div className="flex items-center space-x-3 pointer-events-auto">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center glow-border">
            <span className="font-bold text-primary glow-text tracking-widest text-sm">PR</span>
          </div>
          <div>
            <h1 className="font-bold tracking-widest text-foreground">PARTH <span className="text-primary font-normal">AI</span></h1>
            <p className="text-xs text-primary/70 uppercase tracking-widest flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
              System Online
            </p>
          </div>
        </div>
        
        {/* Mode Selector */}
        <div className="pointer-events-auto flex space-x-2 glass-panel p-1 rounded-full text-sm font-medium text-foreground/80">
          <button 
            onClick={() => setIsVoiceMode(false)}
            className={`px-4 py-2 flex items-center space-x-2 rounded-full transition-all ${!isVoiceMode ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'}`}
          >
            <MessageSquare size={16} />
            <span>Chat</span>
          </button>
          <button 
            onClick={() => setIsVoiceMode(true)}
            className={`px-4 py-2 flex items-center space-x-2 rounded-full transition-all ${isVoiceMode ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'}`}
          >
            <Mic size={16} />
            <span>Voice</span>
          </button>
        </div>
      </header>
      
      {/* Main Interactive Layer */}
      <div className="flex-1 flex w-full relative z-10 min-h-0">
        {isVoiceMode ? <VoiceInterface /> : <ChatInterface />}
      </div>
      
    </main>
  );
}
