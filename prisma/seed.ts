import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Toshkent markazi atrofidagi koordinatalar
const TASHKENT = { lat: 41.3111, lng: 69.2797 };
function near(offset: number) {
  return {
    latitude: TASHKENT.lat + (Math.random() - 0.5) * offset,
    longitude: TASHKENT.lng + (Math.random() - 0.5) * offset,
  };
}

const IMG = {
  osh: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&q=80",
  somsa: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80",
  cake: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80",
  salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
  lagman: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80",
  donut: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80",
};

async function main() {
  console.log("🌱 Seed boshlandi...");

  // Toza boshlash (dev)
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  // Demo xaridor (dev fallback auth uchun — telegramId 12345678)
  const demo = await prisma.user.create({
    data: {
      telegramId: BigInt(12345678),
      fullName: "Demo Foydalanuvchi",
      phoneNumber: "+998901234567",
      role: "buyer",
    },
  });

  // Admin
  await prisma.user.create({
    data: {
      telegramId: BigInt(100000001),
      fullName: "Administrator",
      phoneNumber: "+998900000000",
      role: "admin",
    },
  });

  // Sotuvchilar + restoranlar + taomlar
  const sellersData = [
    {
      name: "Osh Markazi",
      phone: "+998901112233",
      address: "Chilonzor, Toshkent",
      dishes: [
        { name: "Toy oshi", cat: "Milliy taomlar", orig: 45000, disc: 28000, qty: 5, img: IMG.osh, end: "21:30" },
        { name: "Somsa (tandir)", cat: "Milliy taomlar", orig: 15000, disc: 9000, qty: 12, img: IMG.somsa, end: "22:00" },
      ],
    },
    {
      name: "Lagmon Xona",
      phone: "+998902223344",
      address: "Yunusobod, Toshkent",
      dishes: [
        { name: "Bo'g'irsoq lagmon", cat: "Milliy taomlar", orig: 38000, disc: 24000, qty: 4, img: IMG.lagman, end: "21:00" },
        { name: "Achchiq-chuchuk salat", cat: "Salatlar", orig: 18000, disc: 11000, qty: 8, img: IMG.salad, end: "21:00" },
      ],
    },
    {
      name: "Burger Time",
      phone: "+998903334455",
      address: "Mirzo Ulug'bek, Toshkent",
      dishes: [
        { name: "Double cheeseburger", cat: "Fast-fud", orig: 42000, disc: 27000, qty: 6, img: IMG.burger, end: "23:00" },
        { name: "Pepperoni pizza", cat: "Fast-fud", orig: 65000, disc: 39000, qty: 3, img: IMG.pizza, end: "23:00" },
      ],
    },
    {
      name: "Shirin Uy",
      phone: "+998904445566",
      address: "Yakkasaroy, Toshkent",
      dishes: [
        { name: "Shokoladli tort (bo'lak)", cat: "Shirinliklar", orig: 32000, disc: 19000, qty: 7, img: IMG.cake, end: "20:30" },
        { name: "Donut (4 dona)", cat: "Shirinliklar", orig: 28000, disc: 16000, qty: 9, img: IMG.donut, end: "20:30" },
      ],
    },
  ];

  let sellerTid = 200000001;
  for (const s of sellersData) {
    const owner = await prisma.user.create({
      data: {
        telegramId: BigInt(sellerTid++),
        fullName: s.name + " egasi",
        phoneNumber: s.phone,
        role: "seller",
      },
    });
    const coords = near(0.08);
    const restaurant = await prisma.restaurant.create({
      data: {
        ownerId: owner.id,
        name: s.name,
        address: s.address,
        latitude: coords.latitude,
        longitude: coords.longitude,
        status: "approved",
      },
    });
    for (const d of s.dishes) {
      await prisma.dish.create({
        data: {
          restaurantId: restaurant.id,
          name: d.name,
          category: d.cat,
          originalPrice: d.orig,
          discountPrice: d.disc,
          quantity: d.qty,
          imageUrl: d.img,
          pickupStart: "18:00",
          pickupEnd: d.end,
          status: "active",
        },
      });
    }
  }

  // Demo uchun bir nechta bildirishnoma
  await prisma.notification.createMany({
    data: [
      { userId: demo.id, title: "Xush kelibsiz!", message: "Uvol Bo'lmasin'ga xush kelibsiz. Chegirmali taomlarni kashf eting!", type: "system", isRead: false },
      { userId: demo.id, title: "Yangi chegirma", message: "Osh Markazi'da toy oshi 38% chegirmada!", type: "new_offer", isRead: false },
    ],
  });

  const counts = {
    users: await prisma.user.count(),
    restaurants: await prisma.restaurant.count(),
    dishes: await prisma.dish.count(),
  };
  console.log("✅ Seed tugadi:", counts);
}

main()
  .catch((e) => {
    console.error("❌ Seed xatosi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
