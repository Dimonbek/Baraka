"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getWebApp, type TelegramWebAppUser } from "@/lib/telegram-webapp";

interface TelegramContextValue {
  ready: boolean;
  user: TelegramWebAppUser | null;
  /** Telegram muhitida ochilganmi (aks holda oddiy brauzer / dev). */
  inTelegram: boolean;
}

const TelegramContext = createContext<TelegramContextValue>({
  ready: false,
  user: null,
  inTelegram: false,
});

export function useTelegram() {
  return useContext(TelegramContext);
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TelegramContextValue>({
    ready: false,
    user: null,
    inTelegram: false,
  });

  useEffect(() => {
    const tg = getWebApp();
    if (!tg) {
      // Oddiy brauzer (dev) — baribir ilovani ko'rsatamiz.
      setState({ ready: true, user: null, inTelegram: false });
      return;
    }

    tg.ready();
    tg.expand();
    // Yorug' dizaynga mos header/fon ranglari
    try {
      tg.setHeaderColor("#ffffff");
      tg.setBackgroundColor("#f6f7f9");
      tg.enableClosingConfirmation();
    } catch {
      /* eski Telegram klientlari ba'zi metodlarni qo'llamasligi mumkin */
    }

    setState({
      ready: true,
      user: tg.initDataUnsafe?.user ?? null,
      inTelegram: Boolean(tg.initData),
    });
  }, []);

  return (
    <TelegramContext.Provider value={state}>
      {children}
    </TelegramContext.Provider>
  );
}
