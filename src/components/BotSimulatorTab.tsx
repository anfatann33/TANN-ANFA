import React, { useState, useEffect } from 'react';
import {
  Send,
  RotateCcw,
  Bot,
  User,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { BotStatusResponse, Category } from '../types';

interface BotSimulatorTabProps {
  botStatus: BotStatusResponse | null;
  categories: Category[];
  initialCategory?: string;
}

interface MessageHistoryItem {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  keyboard?: {
    inline_keyboard: Array<Array<{ text: string; callback_data?: string; url?: string }>>;
  };
  time: string;
}

export const BotSimulatorTab: React.FC<BotSimulatorTabProps> = ({
  botStatus,
  categories,
  initialCategory,
}) => {
  const [messages, setMessages] = useState<MessageHistoryItem[]>([]);
  const [inputCommand, setInputCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeChatUsername] = useState('khmer_customer_855');

  // Load initial /start
  const runStartCommand = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/telegram/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: '/start',
          username: activeChatUsername,
        }),
      });
      const data = await res.json();

      if (data.success && data.response) {
        setMessages([
          {
            id: `msg_${Date.now()}_u`,
            sender: 'user',
            text: '/start',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          {
            id: `msg_${Date.now()}_b`,
            sender: 'bot',
            text: data.response.text,
            keyboard: data.response.replyMarkup,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('Simulator error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runStartCommand();
  }, []);

  // When initialCategory changes
  useEffect(() => {
    if (initialCategory) {
      handleButtonClick(`cat_${initialCategory}`, `Category: ${initialCategory}`);
    }
  }, [initialCategory]);

  const handleButtonClick = async (callbackData?: string, buttonText?: string, url?: string) => {
    if (url) {
      window.open(url, '_blank');
      return;
    }
    if (!callbackData) return;

    setLoading(true);

    // Append user tap as pseudo feedback
    const userMsg: MessageHistoryItem = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text: buttonText || callbackData,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('/api/telegram/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callbackData,
          username: activeChatUsername,
        }),
      });
      const data = await res.json();

      if (data.success && data.response) {
        const botMsg: MessageHistoryItem = {
          id: `msg_${Date.now()}_b`,
          sender: 'bot',
          text: data.response.text,
          keyboard: data.response.replyMarkup,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err) {
      console.error('Simulator callback error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCommand.trim()) return;

    const query = inputCommand.trim();
    setInputCommand('');
    setLoading(true);

    const userMsg: MessageHistoryItem = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('/api/telegram/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: query,
          text: query,
          username: activeChatUsername,
        }),
      });
      const data = await res.json();

      let botText = '';
      let botKeyboard: any = null;

      if (data.response) {
        botText = data.response.text;
        botKeyboard = data.response.replyMarkup;
      } else if (data.result?.replyText) {
        botText = data.result.replyText;
      } else {
        botText = 'Update received and processed by backend.';
      }

      const botMsg: MessageHistoryItem = {
        id: `msg_${Date.now()}_b`,
        sender: 'bot',
        text: botText,
        keyboard: botKeyboard,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Simulator message error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Columns: Phone / Chat Interface */}
      <div className="lg:col-span-2 space-y-4">
        {/* Terminal Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-cyan-600 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white text-sm">
                  {botStatus?.bot?.first_name || 'Khmer Tech Digital Store'}
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded">
                  {botStatus?.bot?.username ? `@${botStatus.bot.username}` : '@khmer_tech_bot'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Live Server Backend Simulator (Tests real bot engine logic)
              </p>
            </div>
          </div>

          <button
            onClick={runStartCommand}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
            title="Reset Chat and send /start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset /start</span>
          </button>
        </div>

        {/* Telegram Chat View */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[520px] max-h-[640px] overflow-y-auto flex flex-col space-y-4 font-sans text-xs">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 space-x-4">
                  <span className="font-medium text-slate-300">
                    {msg.sender === 'user' ? `@${activeChatUsername}` : 'Khmer Tech Bot'}
                  </span>
                  <span>{msg.time}</span>
                </div>

                {/* HTML content formatted message */}
                <div
                  className="whitespace-pre-line leading-relaxed text-[13px]"
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />

                {/* Telegram Inline Keyboard Rendering */}
                {msg.keyboard?.inline_keyboard && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1.5">
                    {msg.keyboard.inline_keyboard.map((row, rIdx) => (
                      <div key={rIdx} className="grid grid-flow-col auto-cols-fr gap-1.5">
                        {row.map((btn, bIdx) => (
                          <button
                            key={bIdx}
                            onClick={() => handleButtonClick(btn.callback_data, btn.text, btn.url)}
                            disabled={loading}
                            className="bg-slate-800/90 hover:bg-cyan-900/60 active:bg-cyan-800/70 text-cyan-200 border border-slate-700/80 hover:border-cyan-600/70 font-medium py-2 px-2.5 rounded-lg text-center text-[11px] truncate transition shadow-sm disabled:opacity-50"
                            title={btn.text}
                          >
                            {btn.text}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-slate-500 text-[11px] italic">
              <Bot className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>Khmer Tech Bot is typing...</span>
            </div>
          )}
        </div>

        {/* Chat input box */}
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputCommand}
            onChange={e => setInputCommand(e.target.value)}
            placeholder="Type /start, /help, or a product keyword (e.g. ChatGPT, Adobe)..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={loading || !inputCommand.trim()}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Right Column: Key Requirement Verification Guide */}
      <div className="space-y-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Verification Checklist</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Verify all Phase 1 requirements directly inside this live terminal emulator:
          </p>

          <div className="space-y-2.5">
            {/* Check 1 */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-white font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>1. /start Welcome in Khmer</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Click "Reset /start" above to verify the authentic Khmer welcome text from store settings.
              </p>
            </div>

            {/* Check 2 */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-white font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. 8 Rows × 3 Columns Keyboards</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Verify the 24 categories arranged in 3 equal columns plus the 5 additional navigation buttons.
              </p>
            </div>

            {/* Check 3 */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-white font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Empty vs Populated Category</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Click an empty category (e.g. Grok or Kimi) to see the Khmer empty notice:
                <br />
                <code className="text-amber-300 text-[10px] block mt-1 bg-amber-950/40 p-1 rounded">
                  "សូមអភ័យទោស ប្រភេទនេះមិនទាន់មានទំនិញនៅឡើយទេ។..."
                </code>
              </p>
            </div>

            {/* Check 4 */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-white font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>4. Keyword Search &amp; Back Button</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Type "ChatGPT" in the message box to test natural language search, and click "⬅️ Back" on any view to return to the root menu.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Click Shortcut Buttons */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
          <span className="font-semibold text-white block text-xs">Quick Test Shortcuts:</span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              onClick={() => handleButtonClick('cat_chatgpt', 'Category: ChatGPT')}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-left truncate transition"
            >
              Test: ChatGPT
            </button>
            <button
              onClick={() => handleButtonClick('cat_grok', 'Category: Grok (Empty)')}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-left truncate transition"
            >
              Test: Grok (Empty)
            </button>
            <button
              onClick={() => handleButtonClick('action_search', 'Action: Search')}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-left truncate transition"
            >
              Test: Search Prompt
            </button>
            <button
              onClick={() => handleButtonClick('action_support', 'Action: Support')}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-left truncate transition"
            >
              Test: Support Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
