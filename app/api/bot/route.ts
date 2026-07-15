import { webhookCallback } from "grammy";
import { getBot } from "@/lib/telegram";

// Telegram webhook — bot yangilanishlarini shu yerga POST qiladi.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bot = getBot();
const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;

export const POST = bot
  ? webhookCallback(bot, "std/http", { secretToken })
  : async () =>
      new Response(JSON.stringify({ error: "Bot sozlanmagan" }), {
        status: 503,
        headers: { "content-type": "application/json" },
      });
