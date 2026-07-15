# 🍱 Uvol Bo'lmasin

Ovqat isrofiga qarshi **Telegram Mini App** — restoranlar kun oxirida qolgan taomlarni chegirmada sotadi, xaridorlar arzon oladi. *"Isrofni to'xtat, barakani top."*

**Stek:** Next.js 16 (App Router) · React 19 · TypeScript · Prisma 7 + Postgres · Tailwind CSS v4 · grammY (Telegram bot) · Vercel Blob.

## Imkoniyatlar

- **Xaridor:** taomlar ro'yxati, qidiruv, kategoriya filtri, joylashuv bo'yicha masofa, bron + tasdiqlash kodi + taymer, saralanganlar, fikr-mulohaza.
- **Sotuvchi:** ro'yxatdan o'tish, taom CRUD (rasm yuklash), buyurtmalarni tasdiqlash/bekor qilish, analitika.
- **Bot:** `/start` ro'yxatdan o'tish (ism + telefon), bildirishnomalar, WebApp menyu tugmasi.
- **Admin** (`/admin`): statistika, foydalanuvchi/restoran boshqaruvi, flash-sale banner.

## Talablar

- **Node.js 22+** (Next 16 + Prisma 7 uchun majburiy)
- **PostgreSQL** — dev'da Docker, prod'da Neon

## Lokal ishga tushirish

```bash
# 1. Paketlar
npm install

# 2. Lokal Postgres (Docker)
docker run -d --name uvol-pg \
  -e POSTGRES_USER=uvol -e POSTGRES_PASSWORD=uvol -e POSTGRES_DB=uvol \
  -p 5433:5432 postgres:16-alpine

# 3. .env sozlash
cp .env.example .env   # qiymatlarni to'ldiring

# 4. Baza + namunaviy ma'lumot
npx prisma db push
npm run db:seed

# 5. Ishga tushirish
npm run dev            # http://localhost:3000
```

> Brauzerda test qilishda auth avtomatik **demo foydalanuvchi**ga tushadi (Telegram shart emas).

### Foydali skriptlar

| Buyruq | Vazifa |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run db:studio` | Prisma Studio (baza ko'rish) |
| `npm run db:seed` | Namunaviy ma'lumot |
| `npm run bot:setup` | Telegram webhook o'rnatish |

## Deploy (Vercel)

1. Repo'ni GitHub'ga push qiling, Vercel'da import qiling.
2. **Neon** Postgres yarating, `DATABASE_URL`ni Vercel env'ga qo'shing.
3. Env'lar: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL` (Vercel domeni), `BLOB_READ_WRITE_TOKEN`, `ADMIN_PASSWORD_HASH`, `AUTH_SECRET`.
4. Deploy'dan so'ng: `npm run bot:setup` (yoki webhook'ni qo'lda o'rnating) — bot `${NEXT_PUBLIC_APP_URL}/api/bot` ga ulanadi.
5. Prisma migratsiya: `npx prisma db push` (yoki `migrate deploy`).

## Loyiha tuzilishi

```
app/
  (app)/          # Telegram Mini App (xaridor + sotuvchi)
  admin/          # Admin panel
  api/            # Route Handlers (buyer, seller, common, admin, bot)
components/       # UI komponentlar
lib/              # db, auth, telegram, blob, utils
prisma/           # schema + seed
```

## Admin

`/admin` → parol (dev: `admin123`). Prod'da `ADMIN_PASSWORD_HASH` va `AUTH_SECRET`ni albatta o'zgartiring.
