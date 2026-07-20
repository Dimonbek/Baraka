import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uvol Bo'lmasin — Pitch Deck",
  description:
    "Restoranlardagi ortiqcha taomni chegirmada sotadigan Telegram Mini App. Isrofni to'xtat, barakani top.",
  openGraph: {
    title: "Uvol Bo'lmasin — Pitch Deck",
    description:
      "Ovqat isrofiga qarshi Telegram Mini App. Muammo, yechim, model va yo'l xaritasi.",
    type: "website",
  },
};

/* ── Kichik yordamchi komponentlar ── */

function Slide({
  n,
  label,
  title,
  subtitle,
  dark,
  children,
}: {
  n: string;
  label: string;
  title: string;
  subtitle?: string;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={
        "px-5 py-16 sm:px-10 sm:py-20 " +
        (dark ? "bg-brand-900 text-white" : "bg-surface text-ink")
      }
    >
      <div className="mx-auto max-w-5xl">
        <p
          className={
            "mb-3 text-[11px] font-bold uppercase tracking-[0.2em] " +
            (dark ? "text-brand-300" : "text-accent-500")
          }
        >
          {n} — {label}
        </p>
        <h2
          className={
            "text-3xl font-extrabold leading-tight sm:text-4xl " +
            (dark ? "text-white" : "text-ink")
          }
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={
              "mt-2 max-w-2xl text-base " +
              (dark ? "text-brand-100" : "text-muted")
            }
          >
            {subtitle}
          </p>
        )}
        <div className="mt-9">{children}</div>
      </div>
    </section>
  );
}

function Card({
  title,
  children,
  tone = "light",
}: {
  title?: string;
  children: React.ReactNode;
  tone?: "light" | "dark" | "outline";
}) {
  const tones = {
    light: "bg-app border-line",
    dark: "bg-brand-800 border-brand-700 text-white",
    outline: "bg-surface border-line",
  };
  return (
    <div className={"rounded-card border p-5 sm:p-6 " + tones[tone]}>
      {title && (
        <h3
          className={
            "mb-2 text-lg font-bold " +
            (tone === "dark" ? "text-white" : "text-ink")
          }
        >
          {title}
        </h3>
      )}
      <div
        className={
          "text-[15px] leading-relaxed " +
          (tone === "dark" ? "text-brand-100" : "text-muted")
        }
      >
        {children}
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  tone = "brand",
}: {
  value: string;
  label: string;
  tone?: "brand" | "accent" | "white";
}) {
  const colors = {
    brand: "text-brand-600",
    accent: "text-accent-500",
    white: "text-white",
  };
  return (
    <div>
      <p className={"text-4xl font-extrabold sm:text-5xl " + colors[tone]}>
        {value}
      </p>
      <p className="mt-1.5 text-sm text-muted">{label}</p>
    </div>
  );
}

/* Chop etish (PDF zaxira) uchun uslublar — Ctrl+P → "Save as PDF" */
const printCss = `
@media print {
  header { display: none !important; }
  section { break-inside: avoid; page-break-inside: avoid; }
  a[href^="http"]::after { content: ""; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
`;

export default function DeckPage() {
  return (
    <main className="bg-app font-sans">
      <style dangerouslySetInnerHTML={{ __html: printCss }} />
      {/* ── Sarlavha paneli ── */}
      <header className="sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 sm:px-10">
          <span className="text-sm font-extrabold tracking-tight text-ink">
            🍱 Uvol Bo&apos;lmasin
          </span>
          <a
            href="https://t.me/Uvol_bolmasinbot"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white"
          >
            Ilovani ochish
          </a>
        </div>
      </header>

      {/* ── 1. Titul ── */}
      <section className="bg-brand-900 px-5 py-20 text-white sm:px-10 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-10 sm:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="inline-block rounded-full bg-accent-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                MVP jonli
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
                UVOL
                <br />
                BO&apos;LMASIN
              </h1>
              <p className="mt-4 text-xl font-semibold text-brand-300 sm:text-2xl">
                Isrofni to&apos;xtat, barakani top
              </p>
              <p className="mt-4 max-w-lg text-base text-brand-100">
                Restoranlardagi ortiqcha taomni chegirmada sotadigan Telegram
                Mini App. Restoran zararni daromadga aylantiradi, xaridor
                sifatli ovqatni 2 barobar arzon oladi.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="https://uvol-bolmasin.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand-900"
                >
                  uvol-bolmasin.vercel.app
                </a>
                <a
                  href="https://t.me/Uvol_bolmasinbot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-brand-600 px-5 py-3 text-sm font-bold text-white"
                >
                  @Uvol_bolmasinbot
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["osh-1", "somsa-1", "lavash-1", "tort-1"].map((f) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={f}
                  src={`/food/${f}.jpg`}
                  alt=""
                  className="aspect-square w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Muammo ── */}
      <Slide
        n="01"
        label="Muammo"
        title="Har kuni kechqurun bir xil manzara"
        subtitle="Ikki tomon ham yutqazadi — restoran ham, xaridor ham."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Card title="Restoran tomoni">
            Kun oxirida pishirilgan, sifatli taom qoladi. Ertaga sotib
            bo&apos;lmaydi — axlatga ketadi. Bu to&apos;g&apos;ridan-to&apos;g&apos;ri
            zarar: mahsulot, vaqt va ish kuchi.
          </Card>
          <Card title="Xaridor tomoni">
            Oilalar arzon va sifatli tayyor ovqat qidiradi. Restoran narxi
            qimmat, kechki chegirmalar haqida esa hech kim bilmaydi — ular
            e&apos;lon qilinmaydi.
          </Card>
        </div>
        <div className="mt-5 rounded-card bg-brand-900 p-6 text-white">
          <p className="text-2xl font-extrabold sm:text-3xl">
            Natija: ovqat axlatga, daromad esa yo&apos;qqa chiqadi
          </p>
          <p className="mt-2 text-brand-100">
            Restoran mahsulotni yo&apos;qotadi · Xaridor imkoniyatni ko&apos;rmaydi
            · Jamiyat resurs isrof qiladi
          </p>
        </div>
      </Slide>

      {/* ── 3. Yechim ── */}
      <Slide
        n="02"
        label="Yechim"
        title="Ortiqcha taomni bir joyga to'playdigan bozor"
        subtitle="Restoran qolgan taomni 30-50% chegirma bilan e'lon qiladi. Xaridor telefonida ko'radi, bron qiladi va borib oladi."
      >
        <div className="grid gap-5 sm:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            {[
              ["Restoran uchun", "Nol daromad o'rniga real pul va yangi mijoz"],
              ["Xaridor uchun", "Sifatli tayyor ovqat, 2 barobar arzon"],
              ["Jamiyat uchun", "Har bir bron — axlatga ketmagan ovqat"],
            ].map(([t, d]) => (
              <div key={t} className="flex gap-3">
                <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-brand-400" />
                <div>
                  <p className="font-bold text-ink">{t}</p>
                  <p className="text-[15px] text-muted">{d}</p>
                </div>
              </div>
            ))}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/food/osh-2.jpg"
            alt="Chegirmali taom"
            className="h-64 w-full rounded-card object-cover sm:h-full"
          />
        </div>
      </Slide>

      {/* ── 4. Qanday ishlaydi ── */}
      <Slide
        n="03"
        label="Qanday ishlaydi"
        title="Uch qadam"
        subtitle="Ro'yxatdan o'tishdan olib ketishgacha — 3 daqiqa."
      >
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            [
              "Restoran e'lon qiladi",
              "Taom nomini yozadi — rasm avtomatik taklif etiladi. Narx, soni va olib ketish vaqtini belgilaydi.",
            ],
            [
              "Xaridor bron qiladi",
              "Yaqin-atrofdagi chegirmalarni ko'radi, bron qiladi va 6 raqamli tasdiqlash kodini oladi.",
            ],
            [
              "Borib oladi va to'laydi",
              "Belgilangan vaqtda borib kodni ko'rsatadi, joyida to'laydi. Ovqat qutqarildi.",
            ],
          ].map(([t, d], i) => (
            <div key={t} className="rounded-card border border-line bg-surface p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-lg font-extrabold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink">{t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[15px] font-semibold text-brand-700">
          To&apos;lov ilovada emas — joyida naqd yoki karta. Bu ishonchni oshiradi
          va integratsiya to&apos;sig&apos;ini olib tashlaydi.
        </p>
      </Slide>

      {/* ── 5. Mahsulot ── */}
      <Slide
        n="04"
        label="Mahsulot"
        title="Mahsulot tayyor va jonli"
        subtitle="G'oya emas — production'ga deploy qilingan, ishlaydigan MVP."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            [
              "Xaridor ilovasi",
              "Qidiruv, kategoriya filtri, masofa bo'yicha saralash (10/50/100 km), bron + tasdiqlash kodi va taymer, saralanganlar.",
            ],
            [
              "Sotuvchi kabineti",
              "Xaritada joylashuv belgilash, taom qo'shish (avto-rasm yoki o'z rasmi), buyurtma boshqaruvi, analitika.",
            ],
            [
              "Telegram bot",
              "/start orqali ro'yxatdan o'tish, telefon tasdiqlash, buyurtma bildirishnomalari.",
            ],
            [
              "Admin panel",
              "Statistika, foydalanuvchi va restoran moderatsiyasi, flash-sale banner.",
            ],
          ].map(([t, d]) => (
            <div
              key={t}
              className="flex gap-4 rounded-card border border-line bg-surface p-5"
            >
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent-500" />
              <div>
                <h3 className="font-bold text-ink">{t}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">{d}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm font-bold text-brand-700">
          Stek: Next.js · TypeScript · Postgres · Telegram Bot API · Vercel
        </p>
      </Slide>

      {/* ── 6. Nega Telegram ── */}
      <Slide
        n="05"
        label="Bozor"
        title="Nega Telegram Mini App?"
        subtitle="O'zbekistonda auditoriya allaqachon shu yerda."
      >
        <div className="grid gap-8 sm:grid-cols-3">
          <Stat
            value="25 mln"
            label="Telegram foydalanuvchisi — internet auditoriyasining 76%"
          />
          <Stat
            value="32,7 mln"
            label="O'zbekistonda internet foydalanuvchisi (89% qamrov)"
          />
          <Stat
            value="82%"
            label="mobil internetni afzal ko'radi"
            tone="accent"
          />
        </div>
        <div className="mt-8 rounded-card bg-brand-900 p-6 text-white sm:p-8">
          <h3 className="text-xl font-extrabold sm:text-2xl">
            Ilova yuklab olish shart emas
          </h3>
          <p className="mt-2 text-brand-100">
            App Store / Play Market to&apos;siqlari yo&apos;q. Foydalanuvchi botga
            <b> /start</b> yozadi — 30 soniyada ilovadan foydalana boshlaydi.
            Mijoz jalb qilish narxi keskin past.
          </p>
        </div>
        <p className="mt-4 text-xs text-faint">
          Manba: DataReportal Digital 2025 Uzbekistan; UzDaily (2025)
        </p>
      </Slide>

      {/* ── 7. Isbotlangan model ── */}
      <Slide
        n="06"
        label="Validatsiya"
        title="Model dunyoda isbotlangan"
        subtitle="Too Good To Go — bir xil g'oya, global miqyosda."
        dark
      >
        <div className="grid gap-6 sm:grid-cols-4">
          {[
            ["157 mln", "2025-yilda qutqarilgan porsiya"],
            ["120 mln", "ro'yxatdan o'tgan foydalanuvchi"],
            ["180 000", "hamkor restoran va do'kon"],
            ["19", "davlat"],
          ].map(([v, l]) => (
            <div key={v} className="rounded-card bg-brand-800 p-5">
              <p className="text-3xl font-extrabold text-white">{v}</p>
              <p className="mt-1.5 text-sm text-brand-100">{l}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <h3 className="text-2xl font-extrabold text-white">
            O&apos;zbekistonda bu bo&apos;shliq hali egallanmagan
          </h3>
          <p className="mt-2 max-w-3xl text-brand-100">
            Bozor isbotlangan, foydalanuvchi xatti-harakati tushunarli. Bizning
            ustunligimiz — mahalliy kontekst: Telegram, o&apos;zbek taomlari va
            naqd to&apos;lov odati.
          </p>
        </div>
        <p className="mt-5 text-xs text-brand-300">
          Manba: RetailDetail EU, Too Good To Go (2025)
        </p>
      </Slide>

      {/* ── 8. Biznes model ── */}
      <Slide
        n="07"
        label="Biznes model"
        title="Har bir qutqarilgan taomdan komissiya"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-card border border-line bg-surface p-6">
            <h3 className="font-bold text-ink">Asosiy daromad</h3>
            <p className="mt-1 text-[15px] text-muted">
              Har bir muvaffaqiyatli bronda restorandan komissiya olinadi.
            </p>
            <p className="mt-4 text-5xl font-extrabold text-accent-500">15-20%</p>
            <p className="mt-1 text-sm text-muted">
              bron summasidan (rejalashtirilgan diapazon)
            </p>
            <p className="mt-4 text-[15px] font-semibold text-brand-700">
              Restoran uchun bu nolga ketadigan mahsulotdan olingan daromad
              ulushi — riski yo&apos;q.
            </p>
          </div>
          <Card title="Kelajakdagi oqimlar" tone="dark">
            <ul className="space-y-2.5">
              {[
                "Restoran uchun promo va yuqorida ko'rinish",
                "Premium sotuvchi obunasi (analitika, banner)",
                "Flash-sale reklama joylari",
                "Yetkazib berish hamkorligi (keyingi bosqich)",
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-300" />
                  {t}
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <p className="mt-5 text-sm text-muted">
          Komissiya foizi va birlik iqtisodi pilot natijalariga qarab yakunlanadi.
        </p>
      </Slide>

      {/* ── 9. Hozirgi holat ── */}
      <Slide
        n="08"
        label="Holat"
        title="Hozirgi holat"
        subtitle="Ochiq aytamiz: mahsulot tayyor, real foydalanuvchi bazasi hali yo'q."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Card title="Bajarilgan">
            <ul className="space-y-2.5">
              {[
                "To'liq MVP ishlab chiqilgan va production'ga deploy qilingan",
                "Telegram bot jonli, ro'yxatdan o'tish oqimi ishlaydi",
                "Xaridor, sotuvchi va admin — uch rol to'liq qamrab olingan",
                "Xaritada joylashuv va masofa bo'yicha filtr ishlaydi",
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {t}
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Keyingi 3 oy" tone="outline">
            <ul className="space-y-2.5">
              {[
                "Toshkentda pilot: dastlabki restoranlarni jalb qilish",
                "Birinchi 1000 real bron va foydalanuvchi intervyulari",
                "Birlik iqtisodini o'lchash va komissiyani yakunlash",
                "Retention va takroriy bron ko'rsatkichlarini kuzatish",
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  {t}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Slide>

      {/* ── 10. Raqobat ── */}
      <Slide
        n="09"
        label="Raqobat"
        title="O'zbekistonda bu yo'nalish bo'sh"
      >
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            [
              "Uvol Bo'lmasin",
              [
                "Ortiqcha taom, 30-50% chegirma",
                "Telegram — o'rnatish shart emas",
                "Joyida to'lov",
                "Restoran uchun yangi daromad",
              ],
              true,
            ],
            [
              "Yetkazib berish ilovalari",
              [
                "To'liq narxdagi menyu",
                "Alohida ilova o'rnatish",
                "Yetkazish narxi qo'shiladi",
                "Isrof muammosini yechmaydi",
              ],
              false,
            ],
            [
              "An'anaviy chegirma",
              [
                "Tasodifiy, e'lon qilinmaydi",
                "Faqat joyida ko'rinadi",
                "Qamrov yo'q",
                "O'lchab bo'lmaydi",
              ],
              false,
            ],
          ].map(([name, items, hl]) => (
            <div
              key={name as string}
              className={
                "rounded-card border p-6 " +
                (hl
                  ? "border-brand-700 bg-brand-900 text-white"
                  : "border-line bg-surface")
              }
            >
              <h3
                className={
                  "font-bold " + (hl ? "text-white" : "text-ink")
                }
              >
                {name as string}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {(items as string[]).map((t) => (
                  <li
                    key={t}
                    className={
                      "flex gap-2.5 text-[15px] " +
                      (hl ? "text-brand-100" : "text-muted")
                    }
                  >
                    <span
                      className={
                        "mt-2 h-1.5 w-1.5 shrink-0 rounded-full " +
                        (hl ? "bg-brand-300" : "bg-faint")
                      }
                    />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[15px] font-semibold text-brand-700">
          Himoyamiz: sotuvchi tarmog&apos;i va mahalliy odatlarga moslashgan oqim —
          ikkalasi ham vaqt talab qiladi.
        </p>
      </Slide>

      {/* ── 11. Yo'l xaritasi ── */}
      <Slide
        n="10"
        label="Yo'l xaritasi"
        title="Toshkentdan boshlab, bosqichma-bosqich"
      >
        <div className="space-y-4">
          {[
            [
              "1-3 oy",
              "Toshkent pilot",
              "20-30 restoran, birinchi 1000 bron, oqimni sayqallash",
              true,
            ],
            [
              "4-6 oy",
              "Shahar bo'ylab o'sish",
              "Komissiyani ishga tushirish, retention o'lchash",
              false,
            ],
            [
              "7-12 oy",
              "Yirik shaharlar",
              "Samarqand, Buxoro, Namangan; tarmoq restoranlar bilan shartnoma",
              false,
            ],
          ].map(([p, t, d, hl]) => (
            <div
              key={p as string}
              className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5 sm:flex-row sm:items-center sm:gap-6"
            >
              <span
                className={
                  "inline-flex w-fit shrink-0 items-center justify-center rounded-xl px-4 py-2 text-sm font-extrabold sm:w-28 " +
                  (hl
                    ? "bg-accent-500 text-white"
                    : "bg-brand-100 text-brand-800")
                }
              >
                {p as string}
              </span>
              <div>
                <p className="font-bold text-ink">{t as string}</p>
                <p className="text-[15px] text-muted">{d as string}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-card bg-brand-50 p-5">
          <p className="font-bold text-brand-800">
            Asosiy o&apos;lchov: qutqarilgan taom soni — biz uchun ham ta&apos;sir,
            ham daromad ko&apos;rsatkichi.
          </p>
        </div>
      </Slide>

      {/* ── 12. Jamoa ── */}
      <Slide
        n="11"
        label="Jamoa"
        title="Mahsulotni o'zimiz qurdik"
        subtitle="G'oyadan jonli MVP gacha — bitta jamoa."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-card border border-line bg-app p-6">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-2xl font-extrabold text-white">
              D
            </span>
            <h3 className="mt-4 text-lg font-bold text-ink">Dilmurod</h3>
            <p className="text-sm font-semibold text-accent-500">
              Asoschi · Mahsulot va muhandislik
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Butun mahsulotni loyihalashtirgan va ishlab chiqqan: Telegram bot,
              Mini App, backend, admin panel va production deploy.
            </p>
          </div>
          <div className="rounded-card border border-line bg-surface p-6">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-2xl font-extrabold text-brand-700">
              +
            </span>
            <h3 className="mt-4 text-lg font-bold text-ink">
              Qo&apos;shilishi kutilmoqda
            </h3>
            <p className="text-sm font-semibold text-accent-500">
              Operatsiyalar va sotuv
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Restoranlarni jalb qilish va Toshkent pilotini boshqarish uchun
              hamkor izlanmoqda.
            </p>
          </div>
        </div>
      </Slide>

      {/* ── 13. So'rov ── */}
      <section className="bg-brand-900 px-5 py-20 text-white sm:px-10 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-300">
            12 — So&apos;rov
          </p>
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Bizga nima kerak
          </h2>
          <p className="mt-2 max-w-2xl text-brand-100">
            Mahsulot tayyor. Endi bizga birinchi restoranlar va to&apos;g&apos;ri
            yo&apos;nalish kerak.
          </p>

          <div className="mt-9 grid gap-5 sm:grid-cols-3">
            {[
              [
                "Mentorlik",
                "Marketplace'da birinchi sotuvchilarni jalb qilish va ikki tomonlama o'sish bo'yicha tajriba",
              ],
              [
                "Tarmoq",
                "Restoran tarmoqlari va HoReCa sohasidagi tanishuvlar",
              ],
              [
                "Pilot",
                "Toshkentda dastlabki 20-30 restoran bilan sinov va real ko'rsatkichlar",
              ],
            ].map(([t, d]) => (
              <div key={t} className="rounded-card bg-brand-800 p-6">
                <span className="block h-2.5 w-2.5 rounded-full bg-accent-500" />
                <h3 className="mt-4 text-lg font-bold text-white">{t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-brand-100">
                  {d}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-brand-700 pt-8">
            <p className="text-2xl font-extrabold text-brand-300 sm:text-3xl">
              Isrofni to&apos;xtat, barakani top
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="https://uvol-bolmasin.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand-900"
              >
                Ilovani ko&apos;rish
              </a>
              <a
                href="https://t.me/Uvol_bolmasinbot"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-brand-600 px-5 py-3 text-sm font-bold text-white"
              >
                Telegram bot
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
