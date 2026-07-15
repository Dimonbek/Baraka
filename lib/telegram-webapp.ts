// Telegram Mini App (WebApp) SDK uchun minimal, tiplangan interfeys.
// To'liq hujjat: https://core.telegram.org/bots/webapps

export interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramWebAppUser;
    start_param?: string;
  };
  colorScheme: "light" | "dark";
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  openTelegramLink: (url: string) => void;
  HapticFeedback?: {
    impactOccurred: (
      style: "light" | "medium" | "heavy" | "rigid" | "soft",
    ) => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

/** Brauzerda WebApp obyektini xavfsiz oladi (SSR'da undefined). */
export function getWebApp(): TelegramWebApp | undefined {
  if (typeof window === "undefined") return undefined;
  return window.Telegram?.WebApp;
}

/** Haptik javob — mavjud bo'lsa ishga tushiradi, aks holda jim. */
export const haptic = {
  impact(style: "light" | "medium" | "heavy" = "medium") {
    getWebApp()?.HapticFeedback?.impactOccurred(style);
  },
  notify(type: "error" | "success" | "warning") {
    getWebApp()?.HapticFeedback?.notificationOccurred(type);
  },
  select() {
    getWebApp()?.HapticFeedback?.selectionChanged();
  },
};
