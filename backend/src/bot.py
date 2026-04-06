import os
import asyncio
from datetime import datetime
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from .config import BOT_TOKEN, APP_URL
from .database import get_db
from .models import User

# --- FSM States ---
class RegStates(StatesGroup):
    waiting_for_name = State()
    waiting_for_phone = State()

# --- Bot Logic ---
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

def get_current_db_user(telegram_id: int):
    db = next(get_db())
    try:
        return db.query(User).filter(User.telegram_id == telegram_id).first()
    finally:
        db.close()

def save_user_info(telegram_id: int, full_name: str = None, phone_number: str = None):
    db = next(get_db())
    try:
        user = db.query(User).filter(User.telegram_id == telegram_id).first()
        if not user:
            user = User(telegram_id=telegram_id, full_name=full_name, role="buyer")
            db.add(user)
        if full_name: user.full_name = full_name
        if phone_number: user.phone_number = phone_number
        db.commit()
    finally:
        db.close()

from aiogram.types import MenuButtonWebApp

async def set_user_menu_button(user_id: int):
    try:
        await bot.set_chat_menu_button(
            chat_id=user_id,
            menu_button=MenuButtonWebApp(
                text="🍱 Baraka Toping",
                web_app=WebAppInfo(url=APP_URL)
            )
        )
    except Exception as e:
        print(f" [DB DEBUG] Menu button set for {user_id} failed: {e}")

@dp.message(Command("start"))
async def start_cmd(message: types.Message, state: FSMContext):
    user = get_current_db_user(message.from_user.id)
    
    # Check if user already registered with phone number
    if user and user.phone_number:
        await set_user_menu_button(message.from_user.id)
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🍱 Baraka Topingni ochish", web_app=WebAppInfo(url=APP_URL))]
        ])
        await message.answer(
            f"Assalomu alaykum, {user.full_name}! Botga xush kelibsiz. \n\n"
            "Baraka isrof qilingan joydan qochadi. \n"
            "Pastdagi tugma orqali ilovani ochishingiz mumkin.",
            reply_markup=keyboard
        )
        return

    # If not registered, start the registration flow
    await message.answer(
        "Assalomu alaykum! Baraka Toping botiga xush kelibsiz. \n\n"
        "Baraka isrof qilingan joydan qochadi. \n\n"
        "Ilovadan foydalanish uchun ro'yxatdan o'tishingiz shart. \n"
        "Iltimos, ismingizni kiriting:"
    )
    await state.set_state(RegStates.waiting_for_name)

@dp.message(RegStates.waiting_for_name)
async def process_name(message: types.Message, state: FSMContext):
    await state.update_data(name=message.text)
    
    phone_keyboard = ReplyKeyboardMarkup(keyboard=[
        [KeyboardButton(text="📞 Telefon raqamni yuborish", request_contact=True)]
    ], resize_keyboard=True, one_time_keyboard=True)
    
    await message.answer(
        f"Raxmat, {message.text}! Endi telefon raqamingizni yuboring (Pastdagi tugmani bosing):",
        reply_markup=phone_keyboard
    )
    await state.set_state(RegStates.waiting_for_phone)

@dp.message(RegStates.waiting_for_phone, F.contact)
@dp.message(RegStates.waiting_for_phone, F.text)
async def process_phone(message: types.Message, state: FSMContext):
    phone = ""
    if message.contact:
        phone = message.contact.phone_number
    else:
        phone = message.text
    
    # Clean and validate Uzbek phone number
    clean_phone = phone.replace("+", "").replace(" ", "")
    if not clean_phone.startswith("998") or len(clean_phone) != 12:
        await message.answer("Iltimos, faqat O'zbekiston raqamini kiriting (Masalan: +998901234567)")
        return
    
    data = await state.get_data()
    save_user_info(message.from_user.id, full_name=data.get("name"), phone_number=f"+{clean_phone}")
    
    await state.clear()
    
    # After registration, set individual menu button 
    await set_user_menu_button(message.from_user.id)

    # After registration, show the WebApp button
    webapp_keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🍱 Baraka Topingni ochish", web_app=WebAppInfo(url=APP_URL))]
    ])
    
    await message.answer(
        "Muvaffaqiyatli ro'yxatga olindingiz! 🎉 \n\n"
        "Endi Baraka Toping ilovasidan to'liq foydalanishingiz mumkin.",
        reply_markup=ReplyKeyboardRemove()
    )
    await message.answer("Ilovani ochish:", reply_markup=webapp_keyboard)

async def run_bot():
    if not BOT_TOKEN:
        print(" [BOT ERROR] No BOT_TOKEN found. Bot will not start.")
        return
    print(" [BOT] Initializing Telegram Bot polling with FSM...")
    while True:
        try:
            await dp.start_polling(bot)
        except Exception as e:
            print(f" [BOT ERROR] Polling failed: {e}. Retrying in 5s...")
            await asyncio.sleep(5)
