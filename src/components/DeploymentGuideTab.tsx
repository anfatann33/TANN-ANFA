import React, { useState } from 'react';
import {
  BookOpen,
  Terminal,
  ShieldCheck,
  Server,
  Link,
  Send,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

export const DeploymentGuideTab: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl text-xs">
      {/* Intro */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
        <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
          <BookOpen className="w-5 h-5" />
          <span>Production Deployment &amp; Webhook Registration Guide</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          Follow these 5 steps to securely configure your Telegram BotFather credentials, deploy to Google Cloud Run, register the production webhook, and test live customer interactions.
        </p>
      </div>

      {/* Step 1: Telegram BotFather */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">
              1
            </span>
            <h4 className="font-semibold text-white text-sm">
              Telegram Bot Token via @BotFather
            </h4>
          </div>
          <a
            href="https://t.me/BotFather"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-cyan-400 hover:underline"
          >
            <span>Open @BotFather</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <p className="text-slate-300 leading-relaxed">
          The bot already exists in BotFather. If you need to retrieve or refresh your token:
        </p>

        <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
          <li>Open Telegram and start a chat with <b>@BotFather</b>.</li>
          <li>Send the command <code className="bg-slate-950 px-1.5 py-0.5 rounded text-cyan-300">/mybots</code>.</li>
          <li>Select your bot (e.g. <b>@KhmerTechStoreBot</b>).</li>
          <li>Choose <b>API Token</b> to display your secret token.</li>
          <li>
            Optional: Customize the description and about text in Khmer using <code className="bg-slate-950 px-1.5 py-0.5 rounded text-cyan-300">/setdescription</code> and <code className="bg-slate-950 px-1.5 py-0.5 rounded text-cyan-300">/setabouttext</code>.
          </li>
        </ol>

        <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg flex items-start space-x-2 text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <b>Security Rule:</b> Never commit your Bot Token to Git, and never expose it in client-side HTML or browser bundles. It must reside exclusively in server-side environment variables.
          </p>
        </div>
      </div>

      {/* Step 2: Configure Environment Variables */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">
            2
          </span>
          <h4 className="font-semibold text-white text-sm">
            Set TELEGRAM_BOT_TOKEN &amp; TELEGRAM_WEBHOOK_SECRET (Where to Click)
          </h4>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h5 className="font-semibold text-cyan-400 text-xs">Option A: In Google Cloud Console (Deployed Cloud Run Service)</h5>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1 leading-relaxed">
              <li>Open <b>Google Cloud Console</b> (<a href="https://console.cloud.google.com/run" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">console.cloud.google.com/run</a>).</li>
              <li>Click on your service name: <b>khmer-tech-store</b>.</li>
              <li>At the top of the page, click the button labeled <b>« Edit &amp; Deploy New Revision »</b>.</li>
              <li>Scroll down to the <b>Container, Variables &amp; Secrets, Connections, Security</b> panel.</li>
              <li>Click on the <b>« Variables &amp; Secrets »</b> tab.</li>
              <li>Under <b>Environment variables</b>, click <b>« + Add Variable »</b>:
                <div className="mt-1.5 ml-4 p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-200 space-y-1">
                  <div>Name: <span className="text-cyan-300">TELEGRAM_BOT_TOKEN</span></div>
                  <div>Value: <span className="text-amber-300">[Paste your token from @BotFather, e.g. 123456789:ABC...]</span></div>
                </div>
              </li>
              <li>Click <b>« + Add Variable »</b> a second time to configure the Webhook Secret:
                <div className="mt-1.5 ml-4 p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-200 space-y-1">
                  <div>Name: <span className="text-cyan-300">TELEGRAM_WEBHOOK_SECRET</span></div>
                  <div>Value: <span className="text-amber-300">[Enter any secure random phrase, e.g. khmer_tech_secret_2026]</span></div>
                </div>
              </li>
              <li>Click the blue <b>« Deploy »</b> button at the bottom of the page. Cloud Run will restart in ~15 seconds with your secrets securely loaded.</li>
            </ol>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h5 className="font-semibold text-cyan-400 text-xs">Option B: In Local Development (<code className="text-white">.env</code> File)</h5>
            <p className="text-slate-300">
              Create or open the <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300 font-mono">.env</code> file in your project root folder and paste:
            </p>
            <div className="relative bg-slate-900 rounded-lg p-3 font-mono text-[11px] text-slate-300 border border-slate-800">
              <button
                onClick={() =>
                  copyToClipboard(
                    `TELEGRAM_BOT_TOKEN="your_token_from_botfather"\nTELEGRAM_WEBHOOK_SECRET="khmer_tech_secret_2026"\nPORT=3000`,
                    'env_sample'
                  )
                }
                className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded transition"
                title="Copy snippet"
              >
                {copiedId === 'env_sample' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <pre className="overflow-x-auto">
{`# Telegram Bot Token from @BotFather
TELEGRAM_BOT_TOKEN="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"

# Secret token to secure incoming webhook requests
TELEGRAM_WEBHOOK_SECRET="khmer_tech_secret_2026"

PORT=3000`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Cloud Run Deployment */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">
            3
          </span>
          <h4 className="font-semibold text-white text-sm">
            Deploy the Container to Google Cloud Run
          </h4>
        </div>

        <p className="text-slate-300">
          Deploy the container image to Cloud Run using the command line or Cloud Build:
        </p>

        <div className="relative bg-slate-950 rounded-lg p-3 font-mono text-[11px] text-slate-300 border border-slate-800 space-y-2">
          <button
            onClick={() =>
              copyToClipboard(
                `# Build container\ngcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/khmer-tech-store\n\n# Deploy with secrets\ngcloud run deploy khmer-tech-store \\\n  --image gcr.io/YOUR_PROJECT_ID/khmer-tech-store \\\n  --platform managed \\\n  --region asia-east1 \\\n  --allow-unauthenticated \\\n  --port 3000 \\\n  --set-env-vars TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN",TELEGRAM_WEBHOOK_SECRET="YOUR_SECRET"`,
                'cloud_run_cmd'
              )
            }
            className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded transition"
            title="Copy command"
          >
            {copiedId === 'cloud_run_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <pre className="overflow-x-auto">
{`# 1. Build and push container image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/khmer-tech-store

# 2. Deploy container to Google Cloud Run
gcloud run deploy khmer-tech-store \\
  --image gcr.io/YOUR_PROJECT_ID/khmer-tech-store \\
  --platform managed \\
  --region asia-east1 \\
  --allow-unauthenticated \\
  --port 3000 \\
  --set-env-vars TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN",TELEGRAM_WEBHOOK_SECRET="YOUR_SECRET"`}
          </pre>
        </div>

        <p className="text-slate-400">
          Once deployment finishes, Google Cloud Run displays your public HTTPS URL (e.g. <code>https://khmer-tech-store-xxx-asia-east1.a.run.app</code>).
        </p>
      </div>

      {/* Step 4: Register Webhook */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">
            4
          </span>
          <h4 className="font-semibold text-white text-sm">
            Register Webhook with Telegram
          </h4>
        </div>

        <p className="text-slate-300">
          Once your Cloud Run URL is live, link Telegram updates to your secure server endpoint <code className="bg-slate-950 px-1.5 py-0.5 rounded text-cyan-300">/api/telegram/webhook</code>:
        </p>

        <p className="text-slate-400">
          <b>Option A:</b> Click the <b>"Set Webhook"</b> button on the <b>Overview</b> tab of this admin dashboard (1-click automatic registration).
        </p>

        <p className="text-slate-400">
          <b>Option B:</b> Call the Telegram API directly using <code className="text-slate-300">curl</code>:
        </p>

        <div className="relative bg-slate-950 rounded-lg p-3 font-mono text-[11px] text-slate-300 border border-slate-800">
          <button
            onClick={() =>
              copyToClipboard(
                `curl -F "url=https://YOUR_CLOUD_RUN_URL/api/telegram/webhook" https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook`,
                'curl_webhook'
              )
            }
            className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded transition"
            title="Copy command"
          >
            {copiedId === 'curl_webhook' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <pre className="overflow-x-auto">
{`curl -F "url=https://YOUR_CLOUD_RUN_URL/api/telegram/webhook" \\
     -F "secret_token=YOUR_OPTIONAL_SECRET" \\
     https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook`}
          </pre>
        </div>

        <p className="text-slate-400">
          To verify that Telegram has connected to your webhook, test with:
        </p>

        <div className="bg-slate-950 rounded-lg p-2.5 font-mono text-[11px] text-slate-300 border border-slate-800">
          <code>curl https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo</code>
        </div>
      </div>

      {/* Step 5: Test /start in Telegram */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <span className="w-6 h-6 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">
            5
          </span>
          <h4 className="font-semibold text-white text-sm">
            Test /start from Telegram App
          </h4>
        </div>

        <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-1">
          <li>Open the Telegram app on your phone, tablet, or desktop.</li>
          <li>Search for your bot's username (or open <code className="bg-slate-950 px-1 rounded text-cyan-300">https://t.me/your_bot_username</code>).</li>
          <li>Click the <b>"START"</b> button at the bottom of the chat or type <code className="bg-slate-950 px-1 rounded text-cyan-300">/start</code>.</li>
          <li>Verify that the bot responds immediately with:
            <ul className="list-disc list-inside pl-5 mt-1 text-slate-400 space-y-0.5">
              <li>The authentic Khmer welcome message</li>
              <li>The 8-row inline keyboard with 3 buttons per column</li>
              <li>The 5 additional buttons (Search, All Products, My Orders, Support, Back)</li>
            </ul>
          </li>
          <li>Click an empty category to see the Khmer empty notice, or click a populated category to see available digital products!</li>
        </ol>

        <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg flex items-center space-x-2 text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-[11px]">
            Once verified in Telegram, your Phase 1 digital store is officially running and ready for Phase 2 DigiSeller and Phase 3 ABA PayWay integrations.
          </p>
        </div>
      </div>
    </div>
  );
};
