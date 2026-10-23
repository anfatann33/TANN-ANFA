import React, { useState } from 'react';
import { Bot, CheckCircle2, AlertTriangle, XCircle, RefreshCw, ExternalLink, Zap } from 'lucide-react';
import { BotStatusResponse } from '../types';

interface HeaderProps {
  botStatus: BotStatusResponse | null;
  loadingStatus: boolean;
  onRefreshStatus: () => void;
  onTestConnection: () => void;
  testLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  botStatus,
  loadingStatus,
  onRefreshStatus,
  onTestConnection,
  testLoading,
}) => {
  const [showTestModal, setShowTestModal] = useState(false);

  const isConnected = Boolean(botStatus?.connected && botStatus?.bot);
  const isConfigured = Boolean(botStatus?.configured);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Store Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-white">
                  Khmer Tech Digital Store
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono font-medium">
                  Phase 1: Bot API
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium font-sans">
                ហាងលក់ផលិតផលឌីជីថល ខ្មែរតិច • Telegram Bot & Admin Console
              </p>
            </div>
          </div>

          {/* Bot Connection Status Pill & Actions */}
          <div className="flex items-center space-x-3">
            {/* Real Telegram Status Indicator */}
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isConnected
                  ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                  : isConfigured
                  ? 'bg-rose-950/60 border-rose-700/60 text-rose-300'
                  : 'bg-amber-950/60 border-amber-700/60 text-amber-300'
              }`}
            >
              {isConnected ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono">@{botStatus?.bot?.username}</span>
                  <span className="hidden sm:inline text-emerald-400/80">• Connected</span>
                </>
              ) : isConfigured ? (
                <>
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Telegram Auth Failed</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Bot Token Not Configured</span>
                  <span className="sm:hidden">Not Configured</span>
                </>
              )}
            </div>

            {/* Test Connection Button */}
            <button
              onClick={onTestConnection}
              disabled={testLoading}
              title="Test real Telegram getMe API"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${testLoading ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Test getMe API</span>
              <span className="md:hidden">Test</span>
            </button>

            {/* Refresh Status Button */}
            <button
              onClick={onRefreshStatus}
              disabled={loadingStatus}
              title="Refresh status"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            >
              <RefreshCw className={`w-4 h-4 ${loadingStatus ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {/* Direct Link to Telegram Bot if username is known */}
            {botStatus?.bot?.username && (
              <a
                href={`https://t.me/${botStatus.bot.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-medium rounded-lg transition"
              >
                <span>Open Bot</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
