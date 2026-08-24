# 🎬 Timeline Video Generator

Ubah file **Timeline.json** dari Google Maps menjadi **video perjalanan MP4** — sepenuhnya di browser kamu, tanpa upload ke server.

Terinspirasi dari [mahlernim/google-timeline-visualizer](https://github.com/mahlernim/google-timeline-visualizer) (MIT). Modul inti (parsing Timeline, geo, camera) diadaptasi dari repo tersebut; fitur premium (custom marker, dark map, route colors, recap card) ditambahkan di sini.

## ✨ Fitur

- 📁 **Multi-file import** — gabungkan Timeline dari beberapa akun Google sekaligus (auto merge + dedupe)
- 🗓️ **Rentang multi-tahun** — month range atau exact dates (bisa lintas tahun)
- 🌑 **Map style**: light / dark
- 🎨 **Route colors**: hot pink, gold, neon green, cyan, putih
- 🎯 **Custom marker**: lingkaran, emoji, atau foto sendiri
- 📊 **Recap card** di akhir video: total jarak, hari, rentang tahun, titik lokasi
- 🎬 **Preview interaktif** (play/pause/seek) sebelum export
- 📹 **Export MP4 H.264** via WebCodecs + [mediabunny](https://github.com/bbc/mediabunny) — 480p / 720p / 1080p / portrait / landscape
- 🔒 **100% di perangkat** — file Timeline & video tidak pernah di-upload (kecuali tile peta dari CARTO/OpenStreetMap sesuai consent)

## 🚀 Jalankan lokal

```bash
npm install
npm run dev
```

Build produksi: `npm run build`

## 📥 Cara dapat Timeline.json

1. Buka Google Maps → tap foto profil
2. Setelan → Konten pribadi
3. **Export data Timeline** → simpan `Timeline.json`
4. Kembali ke aplikasi, pilih file-nya (bisa beberapa sekaligus)

## 🛠 Tech stack

React 19 · Vite 5 · mediabunny (WebCodecs H.264) · TypeScript core modules

## 📜 Lisensi

MIT — modul inti © mahlernim/google-timeline-visualizer, lihat `THIRD_PARTY_NOTICES.md`.
Map data © OpenStreetMap contributors & CARTO.
