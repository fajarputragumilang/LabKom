# TODO - Perbaikan Fullstack Sistem LabKom

## Hasil Audit & Perbaikan

### Perbaikan yang DILAKUKAN (untuk deploy Vercel)

- [x] Tambah `binaryTargets` di `prisma/schema.prisma` (native + linux-musl + debian-openssl) agar Prisma client bekerja di Vercel (runtime Linux)
- [x] Hapus `prisma.config.ts` yang tidak kompatibel dengan Prisma 5 (menggunakan sintaks Prisma 6)
- [x] Tambah script `postinstall: prisma generate` di `package.json` agar Prisma client selalu ter-generate saat build di Vercel
- [x] Tambah `build: prisma generate && next build` di `package.json`
- [x] Buat `.env.example` sebagai template env variables yang wajib di-set di Vercel
- [x] Perbarui `scripts/check-db.js` agar sesuai schema terbaru (count untuk user, lab, booking)

### Temuan (Project sudah matang & benar)

- [x] Struktur App Router benar (halaman di `src/app/`, API di `src/app/api/`)
- [x] Autentikasi bcrypt sudah benar (seed & login)
- [x] Sesi cookie `auth_username` httpOnly (aman XSS)
- [x] Proteksi route via `src/proxy.js` (Next 16 middleware)
- [x] Validasi anti-bentrok jadwal booking
- [x] Schema Prisma lengkap (User, Lab, Booking + relasi & index)
- [x] Migrations & seed data dari Excel sudah benar

### Langkah MANUAL yang WAJIB dilakukan agar deploy Vercel berfungsi

- [ ] Set `DATABASE_URL` di Vercel (Settings > Environment Variables)
- [ ] Set `DIRECT_URL` di Vercel (Settings > Environment Variables)
- [ ] Jalankan `prisma migrate deploy` di Vercel (Build Command) atau via Supabase
- [ ] Push schema terbaru ke GitHub, lalu deploy ulang ke Vercel
      </content>
