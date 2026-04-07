import { useState, useEffect } from 'react';

const translations = {
  'uz-latin': {
    home: "Asosiy",
    cart: "Savat",
    favorites: "Saralangan",
    profile: "Profil",
    seller: "Sotuvchi",
    search_placeholder: "Taom qidirish...",
    all: "Hammasi",
    national: "Milliy taomlar",
    fastfood: "Fast-fud",
    desserts: "Shirinliklar",
    salads: "Salatlar",
    no_offers: "Hozircha hech qanday taklif yo'q",
    connection_error: "Server bilan ulanishda xatolik",
    retry: "Qayta urinish",
    baraka_slogan: "Baraka isrof qilingan joydan qochadi.",
    settings: "Sozlamalar",
    support: "Qo'llab-quvvatlash",
    logout: "Chiqish",
    personal_info: "Shaxsiy ma'lumotlar",
    full_name: "Ism-sharif",
    phone: "Telefon raqam",
    save_changes: "O'zgarishlarni saqlash",
    lang_settings: "Til sozlamalari",
    seller_panel: "Sotuvchi Paneli",
    restaurant_manage: "Restoran va taomlarni boshqarish",
    register_restaurant: "Restoran ro'yxatdan o'tkazish",
    address: "Manzil",
    mark_on_map: "Xaritada belgilash",
    register: "RO'YXATDAN O'TISH",
    active_orders: "Kutilayotgan xaridorlar",
    add_offer: "Yangi taklif qo'shish",
    my_dishes: "Mening taomlarim",
    dish_name: "Taom nomi",
    original_price: "Asl narxi",
    discount_price: "Chegirma narxi",
    quantity: "Soni (Portsiya)",
    category: "Kategoriya",
    publish: "SOTUVGA CHIQARISH"
  },
  'uz-cyrillic': {
    home: "Асосий",
    cart: "Сават",
    favorites: "Сараланган",
    profile: "Профил",
    seller: "Сотувчи",
    search_placeholder: "Таом қидириш...",
    all: "Ҳаммаси",
    national: "Миллий таомлар",
    fastfood: "Фаст-фуд",
    desserts: "Ширинликлар",
    salads: "Салатлар",
    no_offers: "Ҳозирча ҳеч қандай таклиф йўқ",
    connection_error: "Сервер билан уланишда хатолик",
    retry: "Қайта уриниш",
    baraka_slogan: "Барака исроф қилинган жойдан қочади.",
    settings: "Созламалар",
    support: "Қўллаб-қувватлаш",
    logout: "Чиқиш",
    personal_info: "Шахсий маълумотлар",
    full_name: "Исм-шариф",
    phone: "Телефон рақам",
    save_changes: "Ўзгаришларни сақлаш",
    lang_settings: "Тил созламалари",
    seller_panel: "Сотувчи Панели",
    restaurant_manage: "Ресторан ва таомларни бошқариш",
    register_restaurant: "Ресторан рўйхатдан ўтказиш",
    address: "Манзил",
    mark_on_map: "Харитада белгилаш",
    register: "РЎЙХАТДАН ЎТИШ",
    active_orders: "Кутилаётган харидорлар",
    add_offer: "Янги таклиф қўшиш",
    my_dishes: "Менинг таомларим",
    dish_name: "Таом номи",
    original_price: "Асл нархи",
    discount_price: "Чегирма нархи",
    quantity: "Сони (Порция)",
    category: "Категория",
    publish: "СОТУВГА ЧИҚАРИШ"
  },
  'ru': {
    home: "Главная",
    cart: "Корзина",
    favorites: "Избранное",
    profile: "Профиль",
    seller: "Продавец",
    search_placeholder: "Поиск еды...",
    all: "Все",
    national: "Национальные блюда",
    fastfood: "Фаст-фуд",
    desserts: "Десерты",
    salads: "Салаты",
    no_offers: "Пока нет предложений",
    connection_error: "Ошибка подключения к серверу",
    retry: "Повторить",
    baraka_slogan: "Барака уходит оттуда, где есть расточительство.",
    settings: "Настройки",
    support: "Поддержка",
    logout: "Выйти",
    personal_info: "Личные данные",
    full_name: "Имя Фамилия",
    phone: "Номер телефона",
    save_changes: "Сохранить",
    lang_settings: "Настройки языка",
    seller_panel: "Панель Продавца",
    restaurant_manage: "Управление рестораном и блюдами",
    register_restaurant: "Регистрация ресторана",
    address: "Адрес",
    mark_on_map: "Отметить на карте",
    register: "ЗАРЕГИСТРИРОВАТЬСЯ",
    active_orders: "Ожидающие покупатели",
    add_offer: "Добавить предложение",
    my_dishes: "Мои блюда",
    dish_name: "Название",
    original_price: "Обычная цена",
    discount_price: "Цена со скидкой",
    quantity: "Количество (Порций)",
    category: "Категория",
    publish: "В ПРОДАЖУ"
  }
};

export function useTranslation() {
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'uz-latin');

  useEffect(() => {
    const handleStorageChange = () => {
      setLang(localStorage.getItem('app_lang') || 'uz-latin');
    };
    window.addEventListener('language_changed', handleStorageChange);
    return () => window.removeEventListener('language_changed', handleStorageChange);
  }, []);

  const setLanguage = (newLang: string) => {
    localStorage.setItem('app_lang', newLang);
    setLang(newLang);
    window.dispatchEvent(new Event('language_changed'));
  };

  const t = (key: keyof typeof translations['uz-latin']): string => {
    // @ts-ignore
    return translations[lang]?.[key] || translations['uz-latin'][key] || key;
  };

  return { t, lang, setLanguage };
}
