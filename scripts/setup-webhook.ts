import "dotenv/config";
import { Bot } from "grammy";

/**
 * Telegram webhook'ini o'rnatadi: `${NEXT_PUBLIC_APP_URL}/api/bot`.
 * Ishga tushirish: npm run bot:setup
 * (Dev'da NEXT_PUBLIC_APP_URL = ngrok URL, prod'da Vercel domeni bo'lsin.)
 */
async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!token) throw new Error("TELEGRAM_BOT_TOKEN topilmadi (.env)");
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL topilmadi (.env)");

  const bot = new Bot(token);
  const webhookUrl = `${appUrl.replace(/\/$/, "")}/api/bot`;

  await bot.api.setWebhook(webhookUrl, {
    secret_token: secretToken,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  });

  await bot.api.setMyCommands([
    { command: "start", description: "Botni ishga tushirish / ro'yxatdan o'tish" },
  ]);

  const info = await bot.api.getWebhookInfo();
  console.log("✅ Webhook o'rnatildi:");
  console.log("   URL:", info.url);
  console.log("   Pending updates:", info.pending_update_count);
}

main().catch((e) => {
  console.error("❌ Webhook o'rnatilmadi:", e.message ?? e);
  process.exit(1);
});
