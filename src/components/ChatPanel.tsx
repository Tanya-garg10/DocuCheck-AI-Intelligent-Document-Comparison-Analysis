import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Quote, 
  HelpCircle, 
  CheckCircle2, 
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ChatMessage } from '../types/comparison';
import { FormattedText } from './FormattedText';

interface ChatPanelProps {
  originalText: string;
  updatedText: string;
  originalName: string;
  updatedName: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  originalText,
  updatedText,
  originalName,
  updatedName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I have analyzed **${originalName}** and **${updatedName}**. Ask me any question about modifications, deletions, financial terms, or specific clauses. Every answer is grounded directly in the document text.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedEvidence, setExpandedEvidence] = useState<{ [id: string]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'What are the biggest changes?',
    'Which information was removed?',
    'Summarize the updated document',
    'Did salary or financial amounts change?',
    'Are there changes to notice period or term?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const toggleEvidence = (msgId: string) => {
    setExpandedEvidence((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      // Send conversation history to the grounded backend
      const apiMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText,
          updatedText,
          originalDocumentName: originalName,
          updatedDocumentName: updatedName,
          messages: apiMessages,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to get answer from AI engine');
      }

      const data = await res.json();
      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'No answer generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        evidenceSnippets: data.evidenceSnippets || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `I encountered an issue analyzing your question: ${err.message || 'Server error'}. Please try asking in a different way or check your connection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E9EAF1] shadow-xs flex flex-col h-[650px] overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-4 border-b border-[#E9EAF1] bg-[#F8F9FC] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#F0EDFF] flex items-center justify-center text-[#6558E8]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#171A2B] flex items-center gap-1.5">
              <span>Chat with Your Documents</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-emerald-50 text-[#15966B] border border-emerald-200/80 rounded font-mono font-medium">
                Grounded
              </span>
            </h3>
            <p className="text-[11px] text-[#777D91]">
              Instant questions answered with exact text excerpts as proof
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'reset',
                role: 'assistant',
                content: `Chat history cleared. You can ask new questions about ${originalName} and ${updatedName}.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }}
          title="Reset conversation"
          className="p-1.5 text-[#777D91] hover:text-[#171A2B] hover:bg-white rounded-lg border border-transparent hover:border-[#E9EAF1] transition-colors cursor-pointer text-xs flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Suggested Questions Carousel */}
      <div className="px-5 py-2.5 bg-white border-b border-[#E9EAF1] flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        <span className="text-[11px] font-semibold text-[#777D91] shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#6558E8]" />
          <span>Suggestions:</span>
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="shrink-0 px-2.5 py-1 bg-[#F8F9FC] hover:bg-[#F0EDFF] text-[#171A2B] hover:text-[#6558E8] border border-[#E9EAF1] hover:border-[#6558E8]/30 rounded-lg transition-colors cursor-pointer text-[11px] disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const hasEvidence = msg.evidenceSnippets && msg.evidenceSnippets.length > 0;
          const isExpanded = expandedEvidence[msg.id] ?? false;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-[#171A2B] text-white'
                    : 'bg-[#F0EDFF] text-[#6558E8] border border-[#6558E8]/20'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-[#6558E8] text-white rounded-tr-xs'
                      : 'bg-[#F8F9FC] text-[#171A2B] border border-[#E9EAF1] rounded-tl-xs'
                  }`}
                >
                  <FormattedText content={msg.content} />

                  <div
                    className={`mt-1.5 text-[10px] ${
                      isUser ? 'text-white/70 text-right' : 'text-[#777D91]'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {/* Evidence Snippets Accordion */}
                {!isUser && hasEvidence && (
                  <div className="bg-white border border-[#E9EAF1] rounded-xl overflow-hidden shadow-2xs">
                    <button
                      onClick={() => toggleEvidence(msg.id)}
                      className="w-full px-3 py-2 bg-[#F8F9FC] hover:bg-[#F0EDFF]/50 border-b border-[#E9EAF1] flex items-center justify-between text-left text-[11px] font-semibold text-[#6558E8] transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Quote className="w-3 h-3 text-[#6558E8]" />
                        <span>Document Evidence ({msg.evidenceSnippets?.length} excerpts)</span>
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-3 space-y-2 text-[11px] font-mono bg-[#FAFAFC]">
                        {msg.evidenceSnippets?.map((snip, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-2 bg-white border border-[#E9EAF1] rounded-lg text-[#171A2B] border-l-2 border-l-[#6558E8] leading-relaxed"
                          >
                            "{snip}"
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-[#F0EDFF] text-[#6558E8] flex items-center justify-center shrink-0">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3.5 bg-[#F8F9FC] border border-[#E9EAF1] rounded-2xl rounded-tl-xs text-xs text-[#777D91] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#6558E8] animate-pulse" />
              <span>Analyzing document context and synthesizing grounded answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 bg-[#F8F9FC] border-t border-[#E9EAF1]">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about changes, amounts, removed clauses..."
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-2.5 bg-white text-xs sm:text-sm text-[#171A2B] placeholder:text-[#777D91] border border-[#E9EAF1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6558E8] focus:border-[#6558E8]"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 p-1.5 rounded-lg bg-[#6558E8] text-white hover:bg-[#5245db] disabled:opacity-40 transition-colors cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="mt-2 text-[10px] text-[#777D91] flex items-center justify-between">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#15966B]" />
            <span>Strictly verified against uploaded document contents.</span>
          </span>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );
};
