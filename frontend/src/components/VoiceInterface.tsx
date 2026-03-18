"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Settings, Volume2 } from 'lucide-react';

export default function VoiceInterface() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const transcriptRef = useRef('');
  const [response, setResponse] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        // Default to a good English voice if available
        const defaultVoice = availableVoices.find(v => v.lang.includes('en-US')) || availableVoices[0];
        setSelectedVoice(defaultVoice.name);
      }
    };
    
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    
    // Setup recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        transcriptRef.current = currentTranscript;
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcriptRef.current.trim()) {
          handleSendVoice(transcriptRef.current);
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        // Prevent onend from firing when unmounting
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Update recognition language when voice changes to match accent reasonably
  useEffect(() => {
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice && recognitionRef.current) {
      recognitionRef.current.lang = voice.lang;
    }
  }, [selectedVoice, voices]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      // onend will handle sending the voice
    } else {
      setTranscript('');
      transcriptRef.current = '';
      setResponse('');
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSendVoice = async (text: string) => {
    if (!text.trim()) return;
    setIsSpeaking(true); // show thinking/speaking state
    setResponse('PARTH AI is thinking...');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      });
      const data = await res.json();
      const aiText = data.response;
      
      // Clean text for speech
      const cleanText = aiText.replace(/!\[.*?\]\(.*?\)/g, '').replace(/[*#_`]+/g, '');
      setResponse(cleanText);
      
      // Speak
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error(error);
      setResponse('Sorry, there was an error connecting to my brain.');
      setIsSpeaking(false);
    }
  };

  return (
    <div className="relative z-10 flex flex-col h-full w-full items-center justify-center p-4">
      
      {/* Voice Selection Dropdown */}
      <div className="absolute top-4 right-4 glass-panel px-4 py-2 rounded-xl flex items-center space-x-2 z-50">
        <Settings size={16} className="text-primary/70" />
        <select 
          className="bg-transparent text-sm text-foreground focus:outline-none appearance-none cursor-pointer"
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
        >
          {voices.map(v => (
            <option key={v.name} className="bg-background text-foreground" value={v.name}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      </div>

      {/* Main Interaction Area */}
      <div className="flex flex-col items-center justify-center space-y-12 w-full max-w-2xl">
        
        {/* Status Text */}
        <div className="text-center h-24 flex flex-col items-center justify-end">
          <p className="text-sm uppercase tracking-widest text-primary/70 font-semibold mb-2">
            {isListening ? "Listening..." : isSpeaking ? "PARTH AI Speaking..." : "Tap to Speak"}
          </p>
          <div className="text-lg md:text-2xl text-foreground/90 font-light min-h-[3rem] text-center px-4 line-clamp-3">
            {isListening ? transcript : isSpeaking ? response : "How can I help you today?"}
          </div>
        </div>

        {/* Big Mic Button - ChatGPT Style Voice Mode */}
        <button 
          onClick={toggleListening}
          className={`relative group flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full transition-all duration-500 shadow-2xl ${
            isListening 
              ? 'bg-red-500/20 shadow-red-500/20' 
              : isSpeaking 
                ? 'bg-primary/20 shadow-primary/40' 
                : 'bg-surface hover:bg-surface-hover shadow-black/50'
          }`}
        >
          {/* Ripples when listening or speaking */}
          {(isListening || isSpeaking) && (
            <>
              <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isListening ? 'bg-red-400' : 'bg-primary'}`}></div>
              <div className={`absolute -inset-4 rounded-full animate-pulse opacity-20 duration-700 ${isListening ? 'bg-red-500' : 'bg-primary'}`}></div>
              <div className={`absolute -inset-8 rounded-full animate-pulse opacity-10 duration-1000 ${isListening ? 'bg-red-500' : 'bg-primary'}`}></div>
            </>
          )}
          
          <div className={`relative z-10 w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-colors duration-300 ${
            isListening ? 'bg-red-500 text-white' : isSpeaking ? 'bg-primary text-black' : 'bg-surface-hover border border-primary/30 text-primary'
          }`}>
            {isSpeaking ? <Volume2 size={40} className="animate-pulse" /> : isListening ? <MicOff size={40} /> : <Mic size={40} />}
          </div>
        </button>
        
        <p className="text-xs text-foreground/40 mt-8 max-w-sm text-center">
          {isListening ? "Tap again to finish speaking and send." : "Tap the microphone to start a voice conversation. Voice options are available in the top right corner."}
        </p>
        
      </div>
    </div>
  );
}
