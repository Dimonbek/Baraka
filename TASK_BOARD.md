# 📋 Baraka Toping - Vazifalar Doskasi (Task Board)

Loyihamiz mukammal xatosiz (bug-free) ishlashi va istalgan vaziyatda ochiqcha (transparent) reaksiya qaytarishi uchun bajarilayotgan hamda qilinishi kerak bo'lgan ishlar ro'yxati:

### 🎯 Davom etayotgan ishlar:

- [x] **Texnik poydevorni shaffoflashtirish (Backend Logging):** 
  - API dagi `500 Internal Server Error` yashirin xatosini darhol telefon oknasida `toast` qilib aniq sababi bilan chiqaradigan mexanizm (`global_exception_handler`) to'g'irlandi.

- [ ] **Sotuvchi bo'lib ro'yxatdan o'tish "Xatolik" (Bug Fix):**
  - "Boshqa profil"dan akkaunt ochib, sotuvchi bo'lishda ro'y berayotgan API qulashi aniqlanmoqda va tuzatiladi.

- [ ] **Bo'sh Saralanganlar bo'limi (Favorites Empty State):**
  - Foydalanuvchida saralanglar bo'lmaganda unga `toast.error` qilib qizil xato bermasdan, sokin tarzda "Sizda hali saralanganlar yo'q" ekrani namoyish etiladi.

- [ ] **Bosh Oynani (Home) qizil xatoliklardan tozalash:**
  - Taomlar ro'yxati tuggab `0` ta kelsa, tizim qotib `Ma'lumotlarni yuklab bo'lmadi` (Connection Error) ni bermasdan, huddi o'ylanganidek "Hali chegirmali taomlar yo'q" xabariga o'tadi.

### ✅ Bajarib bo'lingan qadamlar:
1. `Frontend` arxitekturasi butunlay qismlarga (components) va sahifalarga (pages) ajratilib, modullashtirildi.
2. "Fikr bildirish" dagi Telegram xabar yetib bormasligi (Background Task) eng to'g'ri loyihalashda tuzatildi.
3. Rasm (Taom formasi) yuklash paytidagi Android Telegram Web App lariga xos "Failed to fetch" xatosi maxsus `Blob` yechimida jilovlandi.
4. "Ochish" asosiy bot menyusi eski server havolasi o'rniga Vercelga zanjirlandi.

---
*Ushbu hujjat har bir muammo yopilgandan so'ng yangilanib boradi. 🚀*
