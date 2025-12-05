"use client";

import { useEffect, useState, useRef } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

type Message = {
  id: string;
  from: "user" | "bot" | "system";
  text: string;
  timestamp?: Date;
};

export default function AssistantPanel() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      from: "system",
      text: t("assistant.welcome"),
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [voiceErrorCount, setVoiceErrorCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Show typing hint after voice errors
  useEffect(() => {
    if (voiceErrorCount >= 2) {
      const timer = setTimeout(() => {
        // Focus on input to encourage typing
        document.getElementById("hw-assistant-input")?.focus();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [voiceErrorCount]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const focus = () => {
      const el = document.getElementById("hw-assistant-input");
      el?.focus();
    };
    document.addEventListener("hw:assistant-focus", focus as any);
    return () => document.removeEventListener("hw:assistant-focus", focus as any);
  }, []);

  // Cleanup voice recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  function addMessage(msg: Message) {
    setMessages(prev => [...prev, { ...msg, timestamp: new Date() }]);
  }

  async function handleCommand(cmd: string) {
    setIsTyping(true);
    
    // Get current month from URL
    const url = new URL(window.location.href);
    const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
    
    // Extract explicit date from command if present (e.g., "on 2025-08-24")
    const dateMatch = cmd.match(/\bon\s+(\d{4}-\d{2}-\d{2})\b/);
    const explicitDate = dateMatch ? dateMatch[1] : undefined;
    
    console.log("[handleCommand] Command:", cmd);
    console.log("[handleCommand] Extracted date:", explicitDate);
    console.log("[handleCommand] Selected month:", month);
    
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: cmd, 
          month,
          date: explicitDate, // Pass extracted date
          tz: "America/New_York" // Use US Eastern timezone
        })
      });
      
      if (!res.ok) {
        addMessage({
          id: `err-${Date.now()}`,
          from: "system",
          text: "❌ Error talking to assistant. Please try again."
        });
        return;
      }
      
      const data = await res.json();
      
      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      (data.messages || []).forEach((text: string, i: number) =>
        addMessage({ id: `bot-${Date.now()}-${i}`, from: "bot", text })
      );
      
      // Notify other components that data may have changed
      if (data.effects && data.effects.length > 0) {
        const hasExpenseEffect = data.effects.some((e: any) => 
          e.type === "expense_created" || e.type === "expense_deleted"
        );
        const hasGoalEffect = data.effects.some((e: any) => 
          e.type === "goal_created" || e.type === "goal_deleted"
        );
        const hasWatchEffect = data.effects.some((e: any) => 
          e.type === "watch_created" || e.type === "watch_deleted"
        );
        
        if (hasExpenseEffect) {
          document.dispatchEvent(new CustomEvent("hw:expenses-updated"));
        }
        if (hasGoalEffect) {
          document.dispatchEvent(new CustomEvent("hw:goals-updated"));
        }
        if (hasWatchEffect) {
          document.dispatchEvent(new CustomEvent("hw:watches-updated"));
        }
      }
    } catch (error) {
      addMessage({
        id: `err-${Date.now()}`,
        from: "system",
        text: "❌ Network error. Please check your connection."
      });
    } finally {
      setIsTyping(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    
    addMessage({ id: `u-${Date.now()}`, from: "user", text: trimmed });
    setInput("");
    await handleCommand(trimmed);
  }

  async function handleImageUpload(file: File) {
    setProcessingImage(true);
    setUploadedImage(file);
    
    addMessage({
      id: `u-img-${Date.now()}`,
      from: "user",
      text: `📸 Uploaded receipt: ${file.name}`
    });

    // Show processing message
    const processingMsgId = `bot-processing-${Date.now()}`;
    addMessage({
      id: processingMsgId,
      from: "bot",
      text: "📸 Processing receipt..."
    });

    try {
      const startTime = Date.now();
      
      // Send image to OCR API
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/receipt-ocr", {
        method: "POST",
        body: formData
      });
      
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[UI] OCR completed in ${processingTime}s`);

      if (!response.ok) {
        throw new Error("Failed to process receipt");
      }

      const result = await response.json();

      // Remove processing message
      setMessages(prev => prev.filter(m => m.id !== processingMsgId));

      // Check if we need user input
      if (result.needsInput) {
        addMessage({
          id: `bot-${Date.now()}`,
          from: "bot",
          text: result.message
        });
        setProcessingImage(false);
        return;
      }

      if (result.success && result.data) {
        const { amount, category, merchant, description, confidence, needsConfirmation, date } = result.data;

        // If amount is 0, couldn't parse it
        if (amount === 0) {
          addMessage({
            id: `bot-${Date.now()}`,
            from: "bot",
            text: `${result.message}\n\nPlease include the amount like:\n• "water bill $100"\n• "starbucks 25 dollars"`
          });
          setProcessingImage(false);
          return;
        }

        if (needsConfirmation) {
          // Ask user to confirm
          addMessage({
            id: `bot-${Date.now()}`,
            from: "bot",
            text: `${result.message}\n\n📋 Extracted:\n💰 Amount: $${amount.toFixed(2)}\n📁 Category: ${category}\n🏪 Merchant: ${merchant}\n📅 Date: ${date}\n📝 Description: ${description}\n\n❓ Reply "yes" to add, or correct any details.`
          });
          
          // Store pending expense for confirmation
          (window as any).pendingExpense = { amount, category, description, date };
        } else {
          // Auto-add transaction
          addMessage({
            id: `bot-${Date.now()}`,
            from: "bot",
            text: `${result.message}\n\n📋 Details:\n💰 Amount: $${amount.toFixed(2)}\n📁 Category: ${category}\n🏪 Merchant: ${merchant}\n📅 Date: ${date}\n📝 Description: ${description}\n\n✅ Adding transaction...`
          });

          // Always include date - either from receipt or explicitly use today
          const today = new Date().toISOString().split('T')[0];
          const dateStr = date ? ` on ${date}` : ` on ${today}`;
          const expenseCommand = `add ${amount} for ${description} category ${category}${dateStr}`;
          console.log("[OCR] Command:", expenseCommand);
          await handleCommand(expenseCommand);

          // Provide correction options
          addMessage({
            id: `bot-${Date.now()}`,
            from: "bot",
            text: `✅ Transaction added!\n\nIf wrong:\n• "delete transaction" to remove\n• Or correct: "change amount to $150" / "change category to Food"`
          });
        }
      } else {
        addMessage({
          id: `bot-${Date.now()}`,
          from: "bot",
          text: "I couldn't read the receipt clearly. Please tell me:\n1. How much was the expense?\n2. What category? (Food, Transit, Bills, etc.)\n3. What was it for?"
        });
      }
    } catch (error) {
      console.error("Image processing error:", error);
      addMessage({
        id: `bot-${Date.now()}`,
        from: "bot",
        text: "Sorry, I had trouble processing that image. Please try again or enter the expense manually."
      });
    } finally {
      setProcessingImage(false);
      setUploadedImage(null);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    } else if (file) {
      addMessage({
        id: `sys-${Date.now()}`,
        from: "system",
        text: "Please upload an image file (JPG, PNG, etc.)"
      });
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function stopListening() {
    if (recognitionRef.current) {
      console.log("[Voice] Manually stopping");
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("[Voice] Error stopping:", e);
      }
      setListening(false);
      recognitionRef.current = null;
    }
  }

  function startListening() {
    // Check if already listening
    if (listening) {
      stopListening();
      return;
    }

    // After multiple failures, just focus on text input
    if (voiceErrorCount >= 3) {
      addMessage({
        id: `sys-${Date.now()}`,
        from: "system",
        text: "💬 Let's use text instead!\n\nType any command below:\n• 'Add 50 dollars for groceries'\n• 'Monthly summary'\n• 'Set goal 1000 for food'\n\nWorks exactly the same! ✨"
      });
      document.getElementById("hw-assistant-input")?.focus();
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      addMessage({
        id: `sys-${Date.now()}`,
        from: "system",
        text: "💬 Voice not available, but typing works great!\n\nTry: 'Add 50 dollars for groceries'"
      });
      document.getElementById("hw-assistant-input")?.focus();
      return;
    }

    // Clean up any existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }

    const rec = new SR();
    recognitionRef.current = rec;
    
    // Set language based on user preference
    const langMap: Record<string, string> = {
      en: "en-US",
      hi: "hi-IN",
      te: "te-IN",
      kn: "kn-IN",
      ml: "ml-IN",
      ta: "ta-IN"
    };
    
    rec.lang = langMap[language] || "en-US";
    rec.continuous = true; // Keep listening for complete sentences
    rec.interimResults = true; // Show interim results for feedback
    rec.maxAlternatives = 1;
    
    // Request microphone permission explicitly first
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          console.log("[Voice] Microphone permission granted");
        })
        .catch((err) => {
          console.error("[Voice] Microphone permission denied:", err);
          setListening(false);
          recognitionRef.current = null;
          addMessage({
            id: `sys-${Date.now()}`,
            from: "system",
            text: "🚫 Microphone access denied!\n\n1. Click 🔒 in address bar\n2. Allow microphone for this site\n3. Refresh and try again\n\nOr type your command below! 👇"
          });
          return;
        });
    }
    
    let hasStarted = false;
    let hasResult = false;
    let hasProcessed = false;
    let startTimeout: NodeJS.Timeout | null = null;
    let silenceTimeout: NodeJS.Timeout | null = null;
    let maxListeningTimeout: NodeJS.Timeout | null = null;
    let finalTranscriptAccumulated = "";
    
    // If recognition doesn't start within 3 seconds, show error
    startTimeout = setTimeout(() => {
      if (!hasStarted && !hasResult) {
        console.log("[Voice] Start timeout - recognition didn't start");
        setListening(false);
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            // Ignore
          }
        }
        recognitionRef.current = null;
        setVoiceErrorCount(prev => prev + 1);
        addMessage({
          id: `sys-${Date.now()}`,
          from: "system",
          text: "⏱️ Voice recognition timed out.\n\nTry:\n1. Check microphone permissions\n2. Refresh the page\n3. Or just type your command! 👇"
        });
      }
    }, 3000);
    
    rec.onstart = () => {
      console.log("[Voice] Started listening");
      hasStarted = true;
      setListening(true);
      setInput(""); // Clear input
      if (startTimeout) clearTimeout(startTimeout);
      
      // Maximum listening time: 30 seconds
      maxListeningTimeout = setTimeout(() => {
        console.log("[Voice] Max listening time reached (30s)");
        if (rec) rec.stop();
      }, 30000);
    };
    
    rec.onend = () => {
      console.log("[Voice] Stopped listening, hasResult:", hasResult, "Accumulated:", finalTranscriptAccumulated, "hasProcessed:", hasProcessed);
      setListening(false);
      recognitionRef.current = null;
      if (startTimeout) clearTimeout(startTimeout);
      if (silenceTimeout) clearTimeout(silenceTimeout);
      if (maxListeningTimeout) clearTimeout(maxListeningTimeout);
      
      // Process accumulated transcript if we have one and haven't processed yet
      if (finalTranscriptAccumulated.trim() && !hasProcessed) {
        hasProcessed = true;
        console.log("[Voice] Processing accumulated transcript:", finalTranscriptAccumulated);
        setInput("");
        addMessage({ id: `u-${Date.now()}`, from: "user", text: finalTranscriptAccumulated.trim() });
        handleCommand(finalTranscriptAccumulated.trim());
      }
    };
    
    rec.onerror = (event: any) => {
      console.error("[Voice] Error:", event.error, event);
      setListening(false);
      recognitionRef.current = null;
      
      // Don't show error if we already got a result
      if (hasResult) return;
      
      // Track error count
      setVoiceErrorCount(prev => prev + 1);
      
      if (event.error === 'no-speech') {
        // Don't show message, just silently fail
        return;
      } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        addMessage({
          id: `sys-${Date.now()}`,
          from: "system",
          text: "🚫 Microphone blocked!\n\n1. Click 🔒 in address bar\n2. Allow microphone\n3. Refresh page\n\nOr just type your command below! 👇"
        });
      } else if (event.error === 'network') {
        // After 2 network errors, suggest typing instead
        if (voiceErrorCount >= 1) {
          addMessage({
            id: `sys-${Date.now()}`,
            from: "system",
            text: "💡 Voice recognition isn't working right now.\n\n✨ Good news: You can type the same commands!\n\nTry typing:\n• 'Add 50 dollars for groceries'\n• 'Monthly summary'\n• 'Set goal 1000 for food'"
          });
        } else {
          addMessage({
            id: `sys-${Date.now()}`,
            from: "system",
            text: "🌐 Network issue with voice recognition.\n\nTip: Type your command in the box below instead! All features work the same. 👇"
          });
        }
      } else if (event.error === 'aborted') {
        // User stopped it, don't show error
        return;
      } else {
        addMessage({
          id: `sys-${Date.now()}`,
          from: "system",
          text: `⚠️ Voice error: ${event.error}.\n\nNo worries! Just type your command below. 👇`
        });
      }
    };
    
    rec.onresult = (ev: any) => {
      hasResult = true;
      let finalTranscript = "";
      let interimTranscript = "";
      
      // Process all results
      for (let i = 0; i < ev.results.length; i++) {
        const transcript = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) {
          finalTranscript += transcript + " ";
          finalTranscriptAccumulated += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }
      
      console.log("[Voice] Result - Final:", finalTranscript, "Interim:", interimTranscript, "Accumulated:", finalTranscriptAccumulated);
      
      // Show interim or accumulated results in input field for feedback
      const displayText = finalTranscriptAccumulated + interimTranscript;
      if (displayText) {
        setInput(displayText.trim());
      }
      
      // Clear any existing silence timeout
      if (silenceTimeout) {
        clearTimeout(silenceTimeout);
      }
      
      // Set a new silence timeout - wait 3 seconds after last speech before stopping
      silenceTimeout = setTimeout(() => {
        if (finalTranscriptAccumulated.trim()) {
          console.log("[Voice] Silence detected, stopping recognition");
          rec.stop(); // This will trigger onend which processes the result
        }
      }, 3000); // Wait 3 seconds of silence before stopping
    };
    
    // Add audio feedback
    rec.onaudiostart = () => {
      console.log("[Voice] Audio capture started");
    };
    
    rec.onspeechstart = () => {
      console.log("[Voice] Speech detected");
    };
    
    rec.onspeechend = () => {
      console.log("[Voice] Speech ended");
    };
    
    try {
      console.log("[Voice] Starting recognition...");
      rec.start();
      
      // Show listening message immediately
      addMessage({
        id: `sys-listening-${Date.now()}`,
        from: "system",
        text: "🎤 Listening... Speak now!"
      });
    } catch (error) {
      console.error("[Voice] Failed to start:", error);
      setListening(false);
      recognitionRef.current = null;
      addMessage({
        id: `sys-${Date.now()}`,
        from: "system",
        text: "❌ Failed to start. Please refresh the page and allow microphone access."
      });
    }
  }

  const quickActions = [
    { label: "Add Expense", icon: "💰", prompt: "Add 20 dollars for path" },
    { label: "Set Goal", icon: "🎯", prompt: "Set yearly goal 1000 for clothes" },
    { label: "Create Watch", icon: "👁️", prompt: "Watch food 500 monthly" },
    { label: "Summary", icon: "📊", prompt: "Monthly summary" },
    { label: "Insights", icon: "💡", prompt: "Insights" },
    { label: "Top Spending", icon: "🔥", prompt: "Most spent on this month" }
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden">
      {/* Header */}
      <div className="hw-bg-card border-b hw-border p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl smooth-float">
              🤖
            </div>
            <div>
              <div className="text-sm font-bold">AI Assistant</div>
              <div className="text-xs text-slate-400">
                {isTyping ? "Typing..." : "Online"}
              </div>
            </div>
          </div>
          <button
            onClick={listening ? stopListening : startListening}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
              listening
                ? "bg-gradient-to-br from-orange-500 to-red-500 text-white animate-pulse scale-110 shadow-lg shadow-orange-500/50"
                : voiceErrorCount >= 3
                ? "hw-btn-secondary opacity-50"
                : "hw-btn-secondary hover:scale-110"
            }`}
            title={
              voiceErrorCount >= 3
                ? "Voice unavailable - Type your command below instead!"
                : listening
                ? "Click to stop"
                : "Click to speak (or type below)"
            }
          >
            {voiceErrorCount >= 3 ? "💬" : listening ? "⏹️" : "🎙️"}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
        {messages.map((m, index) => (
          <div
            key={m.id}
            className={`flex ${m.from === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {m.from === "bot" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm mr-2 flex-shrink-0">
                🤖
              </div>
            )}
            
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                m.from === "user"
                  ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                  : m.from === "bot"
                  ? "hw-bg-card border hw-border text-slate-100 shadow-lg"
                  : "bg-slate-800/50 text-slate-400 italic text-center mx-auto"
              }`}
              style={{ whiteSpace: 'pre-line' }}
            >
              <div className="text-sm leading-relaxed">{m.text}</div>
              {m.timestamp && m.from !== "system" && (
                <div className="text-[10px] opacity-50 mt-1">
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
            
            {m.from === "user" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-sm ml-2 flex-shrink-0">
                👤
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-in slide-in-from-bottom-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm mr-2">
              🤖
            </div>
            <div className="hw-bg-card border hw-border rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInput(action.prompt)}
              className="px-3 py-1.5 rounded-full hw-btn-secondary text-xs font-medium hover:scale-105 transition-all flex items-center gap-1"
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 hw-bg-card border-t hw-border backdrop-blur-sm">
        <form onSubmit={onSubmit} className="flex gap-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {/* Image upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isTyping || processingImage}
            className="hw-btn-secondary px-4 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all flex items-center gap-2"
            title="Upload receipt image"
          >
            {processingImage ? "⏳" : "📸"}
          </button>
          
          <input
            id="hw-assistant-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t("assistant.placeholder")}
            className="flex-1 hw-input rounded-xl px-4 py-3 text-sm"
            disabled={isTyping || processingImage}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping || processingImage}
            className="hw-btn-primary px-6 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
          >
            {isTyping ? "⏳" : "✨"} {t("assistant.send")}
          </button>
        </form>
        
        {/* Hints */}
        <div className="mt-2 space-y-1">
          <div className="text-center text-[10px] text-slate-500">
            💬 Type or 🎙️ speak commands • 📸 Upload receipts
          </div>
          {voiceErrorCount >= 2 && (
            <div className="text-center text-[10px] text-amber-400 animate-pulse">
              💡 Voice not working? Type works perfectly! Try: "Add 50 for groceries"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
