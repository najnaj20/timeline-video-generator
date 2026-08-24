export const SITE_URL = 'https://timeline-video-generator.vercel.app'

export const HOW_TOS = [
  {
    slug: 'export-android',
    breadcrumb: 'Panduan · Export di Android',
    title: 'Cara Export Timeline Google Maps di Android',
    metaTitle: 'Cara Export Timeline Google Maps di Android — Simpan Timeline.json',
    metaDescription:
      'Panduan lengkap export data Timeline Google Maps di HP Android: Setelan → Lokasi → Timeline → Export Timeline.json. Siap untuk diubah jadi video perjalanan.',
    intro:
      'Timeline Google Maps adalah riwayat lokasi yang tersimpan otomatis dari HP Android kamu. Dengan mengekspornya jadi file Timeline.json, kamu bisa mengubah data itu menjadi video perjalanan — misalnya pakai Timeline Video Generator.',
    steps: [
      {
        icon: '🗺️',
        title: 'Buka Google Maps',
        body: 'Buka aplikasi Google Maps di HP Android kamu dan pastikan sudah login ke akun Google yang aktif menyimpan Timeline.',
      },
      {
        icon: '👤',
        title: 'Tap foto profil',
        body: 'Ketuk foto profil atau inisial akun di pojok kanan atas layar untuk membuka menu akun.',
      },
      {
        icon: '⚙️',
        title: 'Masuk ke Setelan → Lokasi → Timeline',
        body: 'Pilih "Setelan", lalu "Lokasi" → "Layanan lokasi" → "Timeline". Pada versi Google Maps lama, jalurnya: Setelan → Konten pribadi → Export data Timeline.',
      },
      {
        icon: '📤',
        title: 'Tap "Export data Timeline"',
        body: 'Di halaman Timeline, pilih "Export data Timeline" lalu "Lanjutkan" (Continue). Google akan menyiapkan file berisi seluruh riwayat lokasimu.',
      },
      {
        icon: '💾',
        title: 'Simpan file Timeline.json',
        body: 'Simpan file di folder yang mudah ditemukan, misalnya Downloads. File bernama Timeline.json siap di-upload ke timeline-video-generator.vercel.app.',
      },
    ],
    tips: [
      'Nama menu bisa sedikit berbeda tergantung merk HP dan versi Android — carilah kata kunci "Timeline" atau "Export data Timeline".',
      'Jika halaman Timeline kosong, buka Google Maps → riwayat lokasi mungkin perlu diaktifkan dulu di Setelan → Lokasi.',
      'File Timeline.json bisa berukuran besar (puluhan MB hingga GB) untuk riwayat bertahun-tahun — pastikan penyimpanan cukup.',
    ],
    faq: [
      {
        q: 'Kenapa menu Timeline tidak muncul di HP saya?',
        a: 'Fitur Timeline hanya tersedia jika Riwayat Lokasi (Location History) aktif di akun Google. Aktifkan di Setelan → Lokasi, lalu tunggu beberapa saat sebelum mencoba export lagi.',
      },
      {
        q: 'Bisakah export hanya untuk periode tertentu?',
        a: 'Ya — di Google Maps kamu bisa memilih rentang tanggal (hari/bulan/tahun) sebelum mengekspor. Tapi tidak masalah jika mengekspor semuanya: di Timeline Video Generator kamu bisa memilih rentang multi-tahun setelah file di-upload.',
      },
      {
        q: 'Apakah file ini aman dibagikan?',
        a: 'File Timeline.json berisi data lokasi pribadi — jangan di-upload ke server sembarangan. Timeline Video Generator memprosesnya 100% di browser kamu, file tidak pernah dikirim ke server.',
      },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Cara Export Timeline Google Maps di Android',
      description: 'Langkah-langkah mengekspor data Timeline Google Maps menjadi file Timeline.json di HP Android.',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Buka Google Maps', text: 'Buka aplikasi Google Maps dan login ke akun Google.' },
        { '@type': 'HowToStep', position: 2, name: 'Tap foto profil', text: 'Ketuk foto profil di pojok kanan atas.' },
        { '@type': 'HowToStep', position: 3, name: 'Setelan → Lokasi → Timeline', text: 'Pilih Setelan, lalu Lokasi → Layanan lokasi → Timeline.' },
        { '@type': 'HowToStep', position: 4, name: 'Export data Timeline', text: 'Tap Export data Timeline lalu Lanjutkan.' },
        { '@type': 'HowToStep', position: 5, name: 'Simpan Timeline.json', text: 'Simpan file Timeline.json di folder Downloads.' },
      ],
    },
  },
  {
    slug: 'export-iphone',
    breadcrumb: 'Panduan · Export di iPhone',
    title: 'Cara Export Timeline Google Maps di iPhone',
    metaTitle: 'Cara Export Timeline Google Maps di iPhone — Panduan Lengkap',
    metaDescription:
      'Cara export data Timeline Google Maps di iPhone: foto profil → Setelan → Konten pribadi → Export data Timeline, simpan di Files. Langkah demi langkah.',
    intro:
      'Di iPhone, ekspor data Timeline Google Maps sedikit berbeda dari Android — tetapi tetap mudah. Hasilnya file Timeline.json yang bisa langsung di-upload ke Timeline Video Generator untuk dibuat video perjalanan.',
    steps: [
      {
        icon: '🗺️',
        title: 'Buka Google Maps di iPhone',
        body: 'Buka aplikasi Google Maps di iPhone kamu dan pastikan login ke akun Google yang menyimpan riwayat Timeline.',
      },
      {
        icon: '👤',
        title: 'Tap foto profil',
        body: 'Ketuk foto profil di pojok kanan atas layar.',
      },
      {
        icon: '⚙️',
        title: 'Setelan → Konten pribadi',
        body: 'Pilih "Setelan", lalu "Konten pribadi" (Personal content). Di sinilah pengaturan data pribadi dan riwayat lokasi berada.',
      },
      {
        icon: '📤',
        title: 'Export data Timeline',
        body: 'Pilih "Export data Timeline" (atau "Unduh data Timeline" pada versi tertentu). Google akan menyiapkan file ekspor.',
      },
      {
        icon: '💾',
        title: 'Simpan di app Files',
        body: 'Simpan file Timeline.json di aplikasi Files (iCloud Drive atau On My iPhone). Dari sana file bisa langsung dipilih di browser.',
      },
    ],
    tips: [
      'Untuk membuat video MP4 di browser, gunakan Safari 16.4 atau lebih baru (iOS 16.4+).',
      'Bisa juga membuka web app dari Safari dan memilih "Add to Home Screen" agar terasa seperti aplikasi.',
      'Jika Timeline tidak lengkap, periksa pengaturan lokasi dan pastikan "Riwayat Lokasi" aktif di akun Google.',
    ],
    faq: [
      {
        q: 'Apakah iPhone dan Android menghasilkan file yang sama?',
        a: 'Ya — keduanya menghasilkan Timeline.json dengan format yang sama, sehingga bisa diproses di Timeline Video Generator tanpa masalah.',
      },
      {
        q: 'File tersimpan di mana?',
        a: 'Kamu bisa memilih lokasi penyimpanan di aplikasi Files. Rekomendasi: iCloud Drive agar tersinkron ke semua perangkat Apple.',
      },
      {
        q: 'Apakah data saya aman?',
        a: 'Timeline Video Generator memproses file 100% di perangkat kamu. File Timeline.json tidak pernah di-upload ke server mana pun.',
      },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Cara Export Timeline Google Maps di iPhone',
      description: 'Langkah-langkah mengekspor data Timeline Google Maps menjadi file Timeline.json di iPhone.',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Buka Google Maps', text: 'Buka aplikasi Google Maps di iPhone.' },
        { '@type': 'HowToStep', position: 2, name: 'Tap foto profil', text: 'Ketuk foto profil di pojok kanan atas.' },
        { '@type': 'HowToStep', position: 3, name: 'Setelan → Konten pribadi', text: 'Pilih Setelan lalu Konten pribadi.' },
        { '@type': 'HowToStep', position: 4, name: 'Export data Timeline', text: 'Pilih Export data Timeline.' },
        { '@type': 'HowToStep', position: 5, name: 'Simpan di Files', text: 'Simpan Timeline.json di aplikasi Files.' },
      ],
    },
  },
  {
    slug: 'create-video',
    breadcrumb: 'Panduan · Buat Video',
    title: 'Cara Membuat Video Perjalanan dari Google Maps Timeline',
    metaTitle: 'Cara Membuat Video Perjalanan dari Google Maps Timeline — Step by Step',
    metaDescription:
      'Tutorial lengkap mengubah Timeline.json Google Maps menjadi video perjalanan MP4: upload, pilih rentang multi-tahun, custom marker, dark map, export. Gratis & 100% privat.',
    intro:
      'Timeline Video Generator mengubah riwayat lokasi Google Maps (Timeline.json) menjadi video perjalanan sinematik — lengkap dengan peta, rute glow, marker bergerak, dan recap card. Berikut panduan lengkapnya.',
    steps: [
      {
        icon: '📁',
        title: 'Upload file Timeline.json',
        body: 'Buka timeline-video-generator.vercel.app lalu pilih file Timeline.json hasil export (lihat panduan export di Android atau iPhone). Bisa juga mencoba "sample perjalanan" untuk melihat cara kerjanya.',
      },
      {
        icon: '📅',
        title: 'Pilih rentang tanggal',
        body: 'Pilih rentang perjalanan — mendukung multi-tahun! Gunakan mode bulan (dari–sampai) atau centang "Pilih tanggal spesifik" untuk rentang presisi.',
      },
      {
        icon: '🎬',
        title: 'Atur video',
        body: 'Isi judul video, durasi (10–60 detik), gerakan kamera (fixed/steady/dynamic), dan format output: 480p–1080p, portrait, atau landscape.',
      },
      {
        icon: '🎨',
        title: 'Kustomisasi tampilan',
        body: 'Pilih map style (light/dark), warna rute (5 preset), dan marker custom: lingkaran, emoji, atau foto sendiri. Aktifkan recap card untuk ringkasan jarak di akhir video.',
      },
      {
        icon: '🛡️',
        title: 'Centang persetujuan peta → Preview',
        body: 'Baca dan centang persetujuan privasi (file kamu tidak di-upload; tile peta dimuat dari CARTO/OpenStreetMap), lalu klik Preview untuk melihat animasi.',
      },
      {
        icon: '⬇️',
        title: 'Buat MP4 & download',
        body: 'Klik "Buat MP4" dan tunggu proses encoding (semua terjadi di browser kamu). Setelah selesai, putar, download, atau share videonya.',
      },
    ],
    tips: [
      'Durasi 10–15 detik cukup untuk X/Twitter, Reels, dan Shorts. Gunakan format portrait (1080×1920) untuk Reels/TikTok, square (1080×1080) untuk X/Instagram.',
      'Marker emoji membuat video terasa personal — coba 📍🚗✈️ sesuai moda transportasi.',
      'Proses 100% on-device: setelah tile peta dimuat, kamu bahkan bisa mematikan internet dan video tetap bisa di-render.',
      'Untuk perjalanan panjang, pilih "dynamic camera" agar video terasa hidup tanpa lompatan zoom.',
    ],
    faq: [
      {
        q: 'Berapa lama proses pembuatan video?',
        a: 'Tergantung durasi dan resolusi. Video 10 detik 480p biasanya selesai dalam hitungan detik–menit; resolusi lebih besar (1080p/portrait) butuh waktu lebih lama karena encoding H.264 terjadi di perangkat.',
      },
      {
        q: 'Apakah file Timeline saya di-upload?',
        a: 'Tidak. Semua pemrosesan terjadi di browser kamu menggunakan WebCodecs. Satu-satunya request jaringan adalah gambar tile peta dari CARTO — dan itu pun kamu konfirmasi dulu lewat checkbox persetujuan.',
      },
      {
        q: 'Apakah gratis?',
        a: 'Ya, gratis dipakai. Jika tools ini bermanfaat, kamu bisa mendukung pengembangannya lewat tombol "Buy me a coffee" — opsional.',
      },
      {
        q: 'Browser apa yang didukung?',
        a: 'Chrome dan Safari 16.4+ (iOS 16.4+). Browser lama tanpa WebCodecs tidak bisa membuat MP4.',
      },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Cara Membuat Video Perjalanan dari Google Maps Timeline',
      description: 'Ubah Timeline.json menjadi video perjalanan MP4 dengan Timeline Video Generator.',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Upload Timeline.json', text: 'Pilih file Timeline.json atau coba sample.' },
        { '@type': 'HowToStep', position: 2, name: 'Pilih rentang tanggal', text: 'Pilih rentang perjalanan, mendukung multi-tahun.' },
        { '@type': 'HowToStep', position: 3, name: 'Atur video', text: 'Judul, durasi, kamera, dan format output.' },
        { '@type': 'HowToStep', position: 4, name: 'Kustomisasi', text: 'Map style, warna rute, dan marker custom.' },
        { '@type': 'HowToStep', position: 5, name: 'Preview', text: 'Centang persetujuan peta lalu preview.' },
        { '@type': 'HowToStep', position: 6, name: 'Buat MP4', text: 'Export MP4 dan download videonya.' },
      ],
    },
  },
]
