export const SITE_URL = 'https://timeline-video-generator.vercel.app'

const EXPORT_ANDROID = {
  slug: 'export-android',
  id: {
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
  },
  en: {
    breadcrumb: 'Guide · Export on Android',
    title: 'How to Export Google Maps Timeline on Android',
    metaTitle: 'How to Export Google Maps Timeline on Android — Save Timeline.json',
    metaDescription:
      'Step-by-step guide to export your Google Maps Timeline data on Android: Settings → Location → Timeline → Export Timeline.json. Ready to turn into a travel video.',
    intro:
      'Google Maps Timeline is the location history automatically saved from your Android phone. By exporting it as a Timeline.json file, you can turn that data into a travel video — for example with the Timeline Video Generator.',
    steps: [
      {
        icon: '🗺️',
        title: 'Open Google Maps',
        body: 'Open the Google Maps app on your Android phone and make sure you are signed in to the Google account that saves Timeline data.',
      },
      {
        icon: '👤',
        title: 'Tap your profile picture',
        body: 'Tap your profile picture or account initials in the top-right corner of the screen to open the account menu.',
      },
      {
        icon: '⚙️',
        title: 'Go to Settings → Location → Timeline',
        body: 'Tap "Settings", then "Location" → "Location services" → "Timeline". On older Google Maps versions the path is: Settings → Personal content → Export Timeline data.',
      },
      {
        icon: '📤',
        title: 'Tap "Export Timeline data"',
        body: 'On the Timeline page, tap "Export Timeline data" then "Continue". Google will prepare a file with your entire location history.',
      },
      {
        icon: '💾',
        title: 'Save the Timeline.json file',
        body: 'Save the file somewhere easy to find, for example Downloads. The Timeline.json file is ready to upload to timeline-video-generator.vercel.app.',
      },
    ],
    tips: [
      'Menu names can vary slightly by phone brand and Android version — look for the keywords "Timeline" or "Export Timeline data".',
      'If your Timeline page looks empty, open Google Maps — location history may need to be enabled first under Settings → Location.',
      'Timeline.json files can be large (tens of MB up to GB) for years of history — make sure you have enough storage.',
    ],
    faq: [
      {
        q: 'Why does the Timeline menu not appear on my phone?',
        a: 'Timeline is only available when Location History is enabled on your Google account. Enable it under Settings → Location, then wait a while before trying to export again.',
      },
      {
        q: 'Can I export only a specific period?',
        a: 'Yes — in Google Maps you can pick a date range (day/month/year) before exporting. But exporting everything is fine too: the Timeline Video Generator lets you pick a multi-year range after uploading.',
      },
      {
        q: 'Is this file safe to share?',
        a: 'Timeline.json contains private location data — do not upload it to random servers. Timeline Video Generator processes it 100% in your browser; the file is never sent to any server.',
      },
    ],
  },
}

const EXPORT_IPHONE = {
  slug: 'export-iphone',
  id: {
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
  },
  en: {
    breadcrumb: 'Guide · Export on iPhone',
    title: 'How to Export Google Maps Timeline on iPhone',
    metaTitle: 'How to Export Google Maps Timeline on iPhone — Full Guide',
    metaDescription:
      'How to export Google Maps Timeline data on iPhone: profile picture → Settings → Personal content → Export Timeline data, save to Files. Step by step.',
    intro:
      'On iPhone, exporting Google Maps Timeline data works a bit differently than on Android — but it is just as easy. You end up with a Timeline.json file you can upload straight to the Timeline Video Generator to create a travel video.',
    steps: [
      {
        icon: '🗺️',
        title: 'Open Google Maps on iPhone',
        body: 'Open the Google Maps app on your iPhone and sign in to the Google account that stores your Timeline history.',
      },
      {
        icon: '👤',
        title: 'Tap your profile picture',
        body: 'Tap the profile picture in the top-right corner of the screen.',
      },
      {
        icon: '⚙️',
        title: 'Settings → Personal content',
        body: 'Tap "Settings", then "Personal content". This is where your personal data and location history settings live.',
      },
      {
        icon: '📤',
        title: 'Export Timeline data',
        body: 'Tap "Export Timeline data" (or "Download Timeline data" on some versions). Google will prepare the export file.',
      },
      {
        icon: '💾',
        title: 'Save to the Files app',
        body: 'Save the Timeline.json file in the Files app (iCloud Drive or On My iPhone). From there it can be picked directly in the browser.',
      },
    ],
    tips: [
      'To render MP4 videos in the browser, use Safari 16.4 or newer (iOS 16.4+).',
      'You can also open the web app from Safari and choose "Add to Home Screen" so it feels like a native app.',
      'If your Timeline looks incomplete, check location settings and make sure "Location History" is enabled on your Google account.',
    ],
    faq: [
      {
        q: 'Do iPhone and Android produce the same file?',
        a: 'Yes — both produce a Timeline.json with the same format, so it can be processed by the Timeline Video Generator without any issue.',
      },
      {
        q: 'Where is the file saved?',
        a: 'You choose the location inside the Files app. Recommended: iCloud Drive so it syncs across all your Apple devices.',
      },
      {
        q: 'Is my data safe?',
        a: 'Timeline Video Generator processes the file 100% on your device. Your Timeline.json is never uploaded to any server.',
      },
    ],
  },
}

const CREATE_VIDEO = {
  slug: 'create-video',
  id: {
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
  },
  en: {
    breadcrumb: 'Guide · Create Video',
    title: 'How to Make a Travel Video from Google Maps Timeline',
    metaTitle: 'How to Make a Travel Video from Google Maps Timeline — Step by Step',
    metaDescription:
      'Complete tutorial to turn Google Maps Timeline.json into a travel MP4: upload, pick a multi-year range, custom marker, dark map, export. Free & 100% private.',
    intro:
      'The Timeline Video Generator turns your Google Maps location history (Timeline.json) into a cinematic travel video — with the map, glowing route, moving marker, and a recap card. Here is the full guide.',
    steps: [
      {
        icon: '📁',
        title: 'Upload your Timeline.json file',
        body: 'Open timeline-video-generator.vercel.app and pick your exported Timeline.json file (see the export guides for Android or iPhone). You can also try the "sample journey" to see how it works.',
      },
      {
        icon: '📅',
        title: 'Pick a date range',
        body: 'Choose your journey range — multi-year supported! Use month mode (from–to) or check "Select exact dates" for a precise range.',
      },
      {
        icon: '🎬',
        title: 'Configure the video',
        body: 'Set the video title, duration (10–60 seconds), camera movement (fixed/steady/dynamic), and output format: 480p–1080p, portrait, or landscape.',
      },
      {
        icon: '🎨',
        title: 'Customize the look',
        body: 'Pick a map style (light/dark), route color (5 presets), and a custom marker: circle, emoji, or your own photo. Enable the recap card for a distance summary at the end.',
      },
      {
        icon: '🛡️',
        title: 'Accept the map consent → Preview',
        body: 'Read and check the privacy consent (your file is never uploaded; map tiles are fetched from CARTO/OpenStreetMap), then click Preview to see the animation.',
      },
      {
        icon: '⬇️',
        title: 'Create MP4 & download',
        body: 'Click "Create MP4" and wait for the encoding process (everything happens in your browser). When it finishes, play, download, or share your video.',
      },
    ],
    tips: [
      '10–15 seconds is enough for X/Twitter, Reels, and Shorts. Use portrait (1080×1920) for Reels/TikTok, square (1080×1080) for X/Instagram.',
      'Emoji markers make the video feel personal — try 📍🚗✈️ to match your transport mode.',
      'The process is 100% on-device: once the map tiles are loaded, you can even turn off the internet and the video will still render.',
      'For long journeys pick the "dynamic camera" so the video feels alive without jarring zoom jumps.',
    ],
    faq: [
      {
        q: 'How long does it take to create the video?',
        a: 'It depends on duration and resolution. A 10-second 480p video usually finishes in seconds to a minute; larger resolutions (1080p/portrait) take longer because H.264 encoding runs on your device.',
      },
      {
        q: 'Is my Timeline file uploaded?',
        a: 'No. All processing happens in your browser using WebCodecs. The only network requests are map tile images from CARTO — and you confirm those via the consent checkbox.',
      },
      {
        q: 'Is it free?',
        a: 'Yes, it is free to use. If the tool is useful to you, you can support its development via the "Buy me a coffee" button — totally optional.',
      },
      {
        q: 'Which browsers are supported?',
        a: 'Chrome and Safari 16.4+ (iOS 16.4+). Older browsers without WebCodecs cannot create MP4s.',
      },
    ],
  },
}

// JSON-LD per bahasa
function buildJsonLd(page, lang) {
  const c = page[lang]
  const mapKey = { 'export-android': 'Android', 'export-iphone': 'iPhone', 'create-video': 'create' }[page.slug]
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: c.title,
    description: c.intro,
    inLanguage: lang === 'id' ? 'id-ID' : 'en-US',
    step: c.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.body,
    })),
  }
}

export const HOW_TOS = [EXPORT_ANDROID, EXPORT_IPHONE, CREATE_VIDEO].map((page) => ({
  slug: page.slug,
  id: { ...page.id, jsonLd: buildJsonLd(page, 'id') },
  en: { ...page.en, jsonLd: buildJsonLd(page, 'en') },
}))