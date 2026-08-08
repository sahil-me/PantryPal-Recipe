import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { Sparkles, X, Send, Trash2, Copy, Check, ChefHat, Bot, User, Lightbulb, RefreshCw } from 'lucide-react';
import { Recipe } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIRecipeAssistantModalProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const EXAMPLE_SUGGESTIONS = [
  'Can I replace butter with olive oil?',
  'Make this recipe vegetarian.',
  'Make this recipe vegan.',
  'Double this recipe for 6 people.',
  'Halve the recipe.',
  'Explain this cooking step.',
  'What can I use instead of eggs?',
  'Is this recipe gluten-free?',
  'How can I make it healthier?',
  'What side dish pairs well with this?'
];

export const AIRecipeAssistantModal: React.FC<AIRecipeAssistantModalProps> = ({
  recipe,
  isOpen,
  onClose,
  showToast
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new message or streaming update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, isLoading]);

  if (!isOpen) return null;

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const query = textToSend.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);
    setStreamingText('');

    try {
      const response = await fetch('/api/ai/recipe-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          recipe,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userQuery: query,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const contentType = response.headers.get('Content-Type') || '';

      if (contentType.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]' || dataStr.includes('"done":true')) {
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  fullText += parsed.text;
                  setStreamingText(fullText);
                }
              } catch (_) {}
            }
          }
        }

        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullText.trim() || `I have analyzed **${recipe.title}** for you.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMsg]);
        setStreamingText('');
      } else {
        const data = await response.json();
        if (data.success && data.response) {
          const assistantMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.response,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMsg]);
        } else {
          throw new Error(data.error || 'Failed to generate response');
        }
      }
    } catch (err: any) {
      console.error('AI Assistant fetch error:', err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered a brief connection issue. Please feel free to try asking your question again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      if (showToast) showToast('AI response error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
      setStreamingText('');
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (showToast) showToast('Copied response to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([]);
    setStreamingText('');
    if (showToast) showToast('Conversation reset', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/55 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-[90vh] max-h-[720px] bg-[#1A1918] rounded-[28px] border border-[#D4AF37]/40 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="px-5 py-4 bg-[#161513] border-b border-[#2A2724] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black flex items-center justify-center font-bold shadow-md shrink-0">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-[#F5F2EB] leading-tight">
                  AI Recipe Assistant
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                  Context-Aware
                </span>
              </div>
              <p className="text-xs text-[#A39C90]">
                Ask anything about <span className="text-[#D4AF37] font-semibold">{recipe.title}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleClear}
                className="p-2 text-[#A39C90] hover:text-[#E6A135] rounded-xl hover:bg-[#23211E] transition-colors cursor-pointer"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-[#A39C90] hover:text-[#F5F2EB] rounded-xl hover:bg-[#23211E] transition-colors cursor-pointer"
              title="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Recipe Snapshot Badge Bar */}
        <div className="px-5 py-2 bg-[#1E1D1B] border-b border-[#2A2724] text-[11px] text-[#A39C90] flex items-center gap-3 overflow-x-auto scrollbar-none shrink-0">
          <span className="font-bold text-[#D4AF37] shrink-0">Recipe Context Active:</span>
          <span className="px-2 py-0.5 rounded-md bg-[#23211E] text-[#C2BCB2] shrink-0">
            {(recipe.ingredients || []).filter(ing => !ing.optional).length} Ingredients
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#23211E] text-[#C2BCB2] shrink-0">
            {recipe.prepTimeMinutes + recipe.cookTimeMinutes}m Total
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#23211E] text-[#C2BCB2] shrink-0">
            {recipe.servings} Servings
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#23211E] text-[#C2BCB2] shrink-0">
            {recipe.cuisine}
          </span>
        </div>

        {/* Conversation Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
          {messages.length === 0 && !streamingText && (
            <div className="py-6 px-2 space-y-5 text-center sm:text-left">
              <div className="p-5 bg-[#1E1D1B] border border-[#2A2724] rounded-2xl space-y-2 shadow-md">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <ChefHat className="w-5 h-5" />
                  <h4 className="font-serif font-bold text-base text-[#F5F2EB]">
                    🍳 Ask PantryPal AI anything about this recipe.
                  </h4>
                </div>
                <p className="text-xs text-[#C2BCB2] leading-relaxed">
                  I have automatically loaded all ingredients, instructions, cooking times, and dietary information for <strong className="text-[#F5F2EB]">{recipe.title}</strong>. Select an example below or type your custom question.
                </p>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-bold text-[#A39C90] uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-[#D4AF37]" /> Example Prompt Suggestions:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EXAMPLE_SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(suggestion)}
                      className="text-left p-3 rounded-xl bg-[#1E1D1B] hover:bg-[#23211E] border border-[#2A2724] hover:border-[#D4AF37]/50 text-xs text-[#F5F2EB] transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                    >
                      <span>• {suggestion}</span>
                      <Sparkles className="w-3.5 h-3.5 text-[#A39C90] group-hover:text-[#D4AF37] transition-colors shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Render Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              } space-y-1`}
            >
              <div className="flex items-center gap-1.5 px-1 text-[10px] text-[#A39C90]">
                {msg.role === 'user' ? (
                  <>
                    <span>You</span>
                    <User className="w-3 h-3 text-[#D4AF37]" />
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-[#D4AF37]" />
                    <span className="text-[#D4AF37] font-semibold">PantryPal AI</span>
                  </>
                )}
              </div>

              <div
                className={`max-w-[88%] sm:max-w-[82%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed relative group ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-black font-semibold rounded-br-xs shadow-md'
                    : 'bg-[#1E1D1B] border border-[#2A2724] text-[#F5F2EB] rounded-bl-xs shadow-md'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="space-y-2">
                    <div className="markdown-body">
                      <Markdown
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            return (
                              <span className="bg-[#2A2724] text-[#D4AF37] px-1.5 py-0.5 rounded text-[11px] font-mono">
                                {children}
                              </span>
                            );
                          },
                          h3({ children }: any) {
                            return <h3 className="text-sm font-serif font-bold text-[#D4AF37] mt-3 mb-1.5">{children}</h3>;
                          },
                          ul({ children }: any) {
                            return <ul className="list-disc pl-4 space-y-1 my-2 text-[#C2BCB2]">{children}</ul>;
                          },
                          ol({ children }: any) {
                            return <ol className="list-decimal pl-4 space-y-1 my-2 text-[#C2BCB2]">{children}</ol>;
                          },
                          li({ children }: any) {
                            return <li className="text-xs sm:text-sm leading-relaxed">{children}</li>;
                          },
                          p({ children }: any) {
                            return <p className="text-xs sm:text-sm text-[#F5F2EB] leading-relaxed my-1">{children}</p>;
                          }
                        }}
                      >
                        {msg.content}
                      </Markdown>
                    </div>

                    <div className="flex items-center justify-end pt-2 border-t border-[#2A2724]/60">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="px-2 py-1 rounded-lg bg-[#23211E] hover:bg-[#2A2724] text-[#A39C90] hover:text-[#D4AF37] text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        title="Copy AI response"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Live Streaming Response Buffer */}
          {streamingText && (
            <div className="flex flex-col items-start space-y-1">
              <div className="flex items-center gap-1.5 px-1 text-[10px] text-[#D4AF37]">
                <Bot className="w-3 h-3 text-[#D4AF37]" />
                <span className="font-semibold">PantryPal AI (Generating...)</span>
              </div>
              <div className="max-w-[88%] sm:max-w-[82%] p-4 rounded-2xl rounded-bl-xs bg-[#1E1D1B] border border-[#D4AF37]/40 text-[#F5F2EB] shadow-md">
                <Markdown
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      return (
                        <span className="bg-[#2A2724] text-[#D4AF37] px-1.5 py-0.5 rounded text-[11px] font-mono">
                          {children}
                        </span>
                      );
                    },
                    h3({ children }: any) {
                      return <h3 className="text-sm font-serif font-bold text-[#D4AF37] mt-3 mb-1.5">{children}</h3>;
                    },
                    ul({ children }: any) {
                      return <ul className="list-disc pl-4 space-y-1 my-2 text-[#C2BCB2]">{children}</ul>;
                    },
                    ol({ children }: any) {
                      return <ol className="list-decimal pl-4 space-y-1 my-2 text-[#C2BCB2]">{children}</ol>;
                    },
                    li({ children }: any) {
                      return <li className="text-xs sm:text-sm leading-relaxed">{children}</li>;
                    },
                    p({ children }: any) {
                      return <p className="text-xs sm:text-sm text-[#F5F2EB] leading-relaxed my-1">{children}</p>;
                    }
                  }}
                >
                  {streamingText}
                </Markdown>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && !streamingText && (
            <div className="flex items-center gap-3 p-3 bg-[#1E1D1B] border border-[#2A2724] rounded-2xl w-fit">
              <Sparkles className="w-4 h-4 text-[#D4AF37] animate-spin" />
              <span className="text-xs text-[#C2BCB2] animate-pulse font-medium">
                PantryPal AI is analyzing the recipe...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer Input Bar */}
        <div className="p-3 sm:p-4 bg-[#161513] border-t border-[#2A2724] shrink-0 space-y-2">
          {messages.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <span className="text-[#A39C90] shrink-0 font-medium">Quick ask:</span>
              {EXAMPLE_SUGGESTIONS.slice(0, 4).map((sugg, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(sugg)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-[#1E1D1B] hover:bg-[#23211E] border border-[#2A2724] hover:border-[#D4AF37]/40 text-[#C2BCB2] hover:text-[#F5F2EB] shrink-0 transition-colors cursor-pointer"
                >
                  {sugg}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask about ${recipe.title}...`}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-[#1E1D1B] border border-[#2A2724] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#F5F2EB] placeholder-[#8A8275] focus:outline-none shadow-md transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-4 sm:px-5 py-3 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] disabled:opacity-40 text-black font-extrabold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/15 flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4 text-black" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
