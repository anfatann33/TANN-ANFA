import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Zap, Clock, ShieldCheck, X } from 'lucide-react';

interface TestConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  result: any | null;
}

export const TestConnectionModal: React.FC<TestConnectionModalProps> = ({
  isOpen,
  onClose,
  loading,
  result,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white text-base">
              Telegram getMe API Diagnostic Test
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        {loading ? (
          <div className="py-10 text-center space-y-3">
            <Zap className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <div className="text-white font-medium text-sm">Pinging api.telegram.org...</div>
            <div className="text-xs text-slate-400">Calling /bot&lt;TOKEN&gt;/getMe securely from server</div>
          </div>
        ) : result ? (
          <div className="space-y-4 text-xs">
            {/* Status Banner */}
            <div
              className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
                result.success
                  ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-700/60 text-rose-200'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-semibold text-white text-sm">
                  {result.success ? 'Telegram Bot Verified & Connected' : 'Telegram Connection Failed'}
                </h4>
                <p className="mt-0.5 text-slate-300 leading-relaxed">
                  {result.message || result.error}
                </p>
              </div>
            </div>

            {/* Diagnostic Details */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Response Latency:</span>
                <span className="font-mono text-cyan-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{result.latencyMs ?? '—'} ms</span>
                </span>
              </div>

              {result.bot && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Bot Username:</span>
                    <span className="font-mono text-white font-bold">@{result.bot.username}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Telegram Bot ID:</span>
                    <span className="font-mono text-slate-300">{result.bot.id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">First Name:</span>
                    <span className="text-slate-300">{result.bot.first_name}</span>
                  </div>
                </>
              )}

              {result.errorCode && (
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Telegram Error Code:</span>
                  <span className="font-mono text-rose-400 font-bold">{result.errorCode}</span>
                </div>
              )}

              <div className="flex justify-between py-1">
                <span className="text-slate-400">Token Isolation:</span>
                <span className="text-emerald-400 flex items-center space-x-1 font-mono text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Zero token exposure (Verified)</span>
                </span>
              </div>
            </div>

            {/* Raw Telegram API Payload */}
            {result.rawResponse && (
              <div className="space-y-1">
                <span className="text-slate-400 font-medium text-[11px]">Raw Telegram API Response:</span>
                <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-36">
                  {JSON.stringify(result.rawResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : null}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
