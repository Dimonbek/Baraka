import os
import asyncio
from datetime import datetime
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton
from .config import BOT_TOKEN, APP_URL

# --- Bot Logic ---
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def start_cmd(message: types.Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🍱 Barakatopingni ochish", web_app=WebAppInfo(url=APP_URL))]
    ])
    
    await message.answer(
        "Assalomu alaykum! Barakatoping botiga xush kelibsiz. \n\n"
        "Biz bilan isrofga qarshi kurashing va mazali taomlarni arzon narxlarda harid qiling.",
        reply_markup=keyboard
    )
    with open("backend/bot.log", "a") as f:
        f.write(f"\n[LOG] {datetime.now()} - /start command received from user {message.from_user.id}")

async def run_bot():
    if not BOT_TOKEN:
        print(" [BOT ERROR] No BOT_TOKEN found. Bot will not start.")
        return

    print(" [BOT] Initializing Telegram Bot polling...")
    with open("backend/bot.log", "a") as f:
        f.write(f"\n[LOG] {datetime.now()} - Bot process initialized and starting polling...")
    
    while True:
        try:
            await dp.start_polling(bot)
        except Exception as e:
            print(f" [BOT ERROR] Polling failed: {e}. Retrying in 5s...")
            with open("backend/bot.log", "a") as f:
                f.write(f"\n[ERROR] {datetime.now()} - Polling failed: {e}")
            await asyncio.sleep(5)
