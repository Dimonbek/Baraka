import { createHmac } from "crypto";
import { prisma } from "./db";
import type { User } from "@prisma/client";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const IS_DEV = process.env.NODE_ENV !== "production";

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

/**
 * Telegram WebApp initData'ni rasmiy algoritm bo'yicha tekshiradi:
 * secret = HMAC_SHA256("WebAppData", bot_token)
 * hash   = HMAC_SHA256(secret, data_check_string)
 * Hujjat: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyTelegramInitData(initData: string): TelegramUser | null {
  if (!initData || !BOT_TOKEN) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  // "hash"dan tashqari barcha maydonlar alifbo tartibida
  const pairs: string[] = [];
  params.forEach((value, key) => {
    if (key !== "hash") pairs.push(`${key}=${value}`);
  });
  pairs.sort();
  const dataCheckString = pairs.join("\n");

  const secretKey = createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();
  const computedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computedHash !== hash) return null;

  // (ixtiyoriy) auth_date yangiligini tekshirish — 24 soat
  const authDate = Number(params.get("auth_date") ?? 0);
  if (authDate && Date.now() / 1000 - authDate > 60 * 60 * 24) return null;

  const userRaw = params.get("user");
  if (!userRaw) return null;
  try {
    return JSON.parse(userRaw) as TelegramUser;
  } catch {
    return null;
  }
}

/**
 * So'rovdan joriy foydalanuvchini aniqlaydi.
 * Telegram Mini App `X-Telegram-Init-Data` sarlavhasini yuboradi.
 * Dev rejimida (imzosiz brauzer testi uchun) demo foydalanuvchiga tushadi.
 */
export async function getCurrentUser(req: Request): Promise<User | null> {
  const initData = req.headers.get("x-telegram-init-data");

  if (initData) {
    const tgUser = verifyTelegramInitData(initData);
    if (tgUser) {
      const fullName = [tgUser.first_name, tgUser.last_name]
        .filter(Boolean)
        .join(" ");
      return prisma.user.upsert({
        where: { telegramId: BigInt(tgUser.id) },
        update: {}, // ism/telefon bot ro'yxatdan o'tishida yangilanadi
        create: {
          telegramId: BigInt(tgUser.id),
          fullName: fullName || tgUser.username || "Foydalanuvchi",
          role: "buyer",
        },
      });
    }
  }

  // Dev fallback — faqat lokal ishlab chiqishda
  if (IS_DEV) {
    return prisma.user.upsert({
      where: { telegramId: BigInt(12345678) },
      update: {},
      create: {
        telegramId: BigInt(12345678),
        fullName: "Demo Foydalanuvchi",
        phoneNumber: "+998901234567",
        role: "buyer",
      },
    });
  }

  return null;
}

/** Route Handler'lar uchun qulay yordamchi: user yo'q bo'lsa 401 tashlaydi. */
export async function requireUser(req: Request): Promise<User> {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new Response(
      JSON.stringify({ error: "Foydalanuvchi aniqlanmadi" }),
      { status: 401, headers: { "content-type": "application/json" } },
    );
  }
  return user;
}
