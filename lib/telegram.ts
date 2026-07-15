import "server-only";
import { Bot, Keyboard, InlineKeyboard } from "grammy";
import { prisma } from "./db";

// Server tomonidagi Telegram bot — grammY, webhook rejimida.
const token = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

let botInstance: Bot | null = null;

function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 9) digits = "998" + digits;
  if (digits.startsWith("998") && digits.length === 12) return "+" + digits;
  return null;
}

async function setMenuButton(bot: Bot, chatId: number, show: boolean) {
  try {
    await bot.api.setChatMenuButton({
      chat_id: chatId,
      menu_button: show
        ? {
            type: "web_app",
            text: "🍱 Uvol Bo'lmasin",
            web_app: { url: APP_URL },
          }
        : { type: "default" },
    });
  } catch {
    /* eski klient — e'tibormas */
  }
}

function appButton() {
  return new InlineKeyboard().webApp("🍱 Ilovani ochish", APP_URL);
}

/** Bot handler'larini bir marta ro'yxatdan o'tkazadi. */
function registerHandlers(bot: Bot) {
  // /start
  bot.command("start", async (ctx) => {
    const tgId = ctx.from?.id;
    if (!tgId) return;

    const fullName = [ctx.from?.first_name, ctx.from?.last_name]
      .filter(Boolean)
      .join(" ");

    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(tgId) },
      update: { fullName: fullName || undefined },
      create: { telegramId: BigInt(tgId), fullName: fullName || "Foydalanuvchi", role: "buyer" },
    });

    // Telefon bor — to'liq ro'yxatdan o'tgan
    if (user.phoneNumber && user.phoneNumber.length > 5) {
      await setMenuButton(bot, tgId, true);
      await ctx.reply(
        `Assalomu alaykum, ${user.fullName}! 🍱\n\n` +
          "Isrofni to'xtating, barakani toping — kechki chegirmalar bir joyda.\n\n" +
          "Pastdagi tugma orqali ilovani oching.",
        { reply_markup: appButton() },
      );
      return;
    }

    // Telefon yo'q — kontakt so'raymiz
    await setMenuButton(bot, tgId, false);
    const kb = new Keyboard()
      .requestContact("📞 Telefon raqamni yuborish")
      .resized()
      .oneTime();
    await ctx.reply(
      'Assalomu alaykum! "Uvol Bo\'lmasin" botiga xush kelibsiz. 🍱✨\n\n' +
        "Ilovadan foydalanish uchun telefon raqamingizni yuboring:",
      { reply_markup: kb },
    );
  });

  // Kontakt qabul qilish
  bot.on("message:contact", async (ctx) => {
    const tgId = ctx.from?.id;
    if (!tgId) return;
    const phone = normalizePhone(ctx.message.contact.phone_number);
    if (!phone) {
      await ctx.reply("Iltimos, O'zbekiston raqamini yuboring (+998...).");
      return;
    }
    await prisma.user.update({
      where: { telegramId: BigInt(tgId) },
      data: { phoneNumber: phone },
    });
    await setMenuButton(bot, tgId, true);
    await ctx.reply("Muvaffaqiyatli ro'yxatdan o'tdingiz! 🎉", {
      reply_markup: { remove_keyboard: true },
    });
    await ctx.reply("Ilovani oching:", { reply_markup: appButton() });
  });

  // Matn orqali raqam (tugma bosmasa)
  bot.on("message:text", async (ctx) => {
    if (ctx.message.text.startsWith("/")) return;
    const tgId = ctx.from?.id;
    if (!tgId) return;
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(tgId) },
    });
    if (user?.phoneNumber) return; // allaqachon ro'yxatdan o'tgan
    const phone = normalizePhone(ctx.message.text);
    if (!phone) return;
    await prisma.user.update({
      where: { telegramId: BigInt(tgId) },
      data: { phoneNumber: phone },
    });
    await setMenuButton(bot, tgId, true);
    await ctx.reply("Muvaffaqiyatli ro'yxatdan o'tdingiz! 🎉", {
      reply_markup: appButton(),
    });
  });
}

export function getBot(): Bot | null {
  if (!token) return null;
  if (!botInstance) {
    botInstance = new Bot(token);
    registerHandlers(botInstance);
  }
  return botInstance;
}

/**
 * Foydalanuvchiga Telegram orqali xabar yuboradi.
 * Xatolik bo'lsa (bloklangan, chat yo'q) — jim, ilova oqimini buzmaydi.
 */
export async function sendBotMessage(
  telegramId: bigint | number,
  text: string,
): Promise<boolean> {
  const bot = getBot();
  if (!bot) return false;
  try {
    await bot.api.sendMessage(Number(telegramId), text, {
      parse_mode: "Markdown",
    });
    return true;
  } catch (err) {
    console.error(`[bot] xabar yuborilmadi (${telegramId}):`, err);
    return false;
  }
}
