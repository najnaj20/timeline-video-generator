export const LOCALES = [
  { id: 'id', label: 'Bahasa Indonesia', short: 'ID', intl: 'id-ID' },
  { id: 'en', label: 'English', short: 'EN', intl: 'en-US' },
]

export function detectLang() {
  const nav = (typeof navigator !== 'undefined' ? navigator.language || 'id' : 'id').toLowerCase()
  return nav.startsWith('id') ? 'id' : 'en'
}

export const STRINGS = {
  id: {
    tagline: 'ubah Timeline Google Maps jadi video perjalanan · 100% di perangkatmu',
    heroTitle: 'Timeline Video Generator',
    heroSub:
      'Upload Timeline.json dari Google Maps — pilih rentang multi-tahun, atur marker 🎯 warna rute 🎨 map dark 🌑, dan export MP4 siap post. File tidak pernah di-upload ke server.',
    fileTitle: '1 · Pilih file Timeline',
    multiFileNote:
      'Bisa pilih beberapa file sekaligus (dari beberapa akun Google) — nanti digabung otomatis.',
    chooseFile: '📁 Pilih Timeline.json',
    sample: '✨ Coba sample perjalanan',
    noFile: 'Belum ada file dimuat',
    loaded: '✓ {count} file dimuat: {name}',
    helpSummary: 'Cara export Timeline dari Google Maps',
    helpStep1: 'Buka Google Maps → tap foto profil.',
    helpStep2: 'Setelan → Konten pribadi.',
    helpStep3: 'Export data Timeline → simpan Timeline.json.',
    helpStep4: 'Balik ke sini, pilih file-nya.',
    settingsTitle: '2 · Atur perjalanan',
    changeFile: '↺ Ganti file',
    loadedSummary: '✓ {name} · {points} titik lokasi · {months} bulan data',
    rangeLabel: 'Rentang tanggal (multi-tahun)',
    exactDates: 'Pilih tanggal spesifik',
    fromMonth: 'Dari bulan',
    toMonth: 'Sampai bulan',
    selectedSummary: '{period} · {points} titik dipilih',
    videoTitle: 'Judul video',
    duration: 'Durasi',
    seconds: '{n} detik',
    camera: 'Gerakan kamera',
    cameraFixed: 'Fixed zoom',
    cameraSteady: 'Steady following',
    cameraDynamic: 'Dynamic following',
    format: 'Format video',
    fmtStandard: 'Kotak · 480p',
    fmtHigh: 'Kotak · 720p',
    fmtUltra: 'Kotak · 1080p',
    fmtPortrait: 'Portrait · 1080×1920',
    fmtLandscape: 'Landscape · 1920×1080',
    mapStyle: 'Map style',
    routeColor: 'Warna rute',
    marker: 'Marker',
    emojiMarker: 'Pilih emoji marker',
    photoMarker: 'Foto marker (otomatis di-crop lingkaran)',
    choosePhoto: '🖼️ Pilih foto',
    consent:
      'Saya paham: file Timeline tidak di-upload, tapi tile peta dimuat dari CARTO (OpenStreetMap) untuk area rute — ini bisa mengungkap lokasi perjalanan ke penyedia tile.',
    previewBtn: '▶️ Preview',
    preparing: '⏳ Menyiapkan…',
    previewTitle: '3 · Preview & export',
    compatWarn: '⚠️ Browser ini tidak bisa encode video (butuh Safari 16.4+ / Chrome)',
    play: '▶️ Play',
    pause: '⏸ Pause',
    exportBtn: '🎬 Buat MP4 ({format})',
    encoding: 'encode MP4…',
    cancel: 'Batal',
    download: '⬇️ Download MP4',
    share: '📤 Share',
    bmc: '☕ Buy me a coffee',
    footerNote:
      'Data diproses 100% di perangkatmu · Map © OpenStreetMap contributors & CARTO',
    errConsent:
      'Centang persetujuan peta dulu — tile peta dimuat dari CARTO (OpenStreetMap).',
    errTooFew: 'Pilih rentang yang berisi minimal 2 titik lokasi.',
    errPrepare: 'Gagal menyiapkan perjalanan.',
    errExport: 'Gagal membuat video.',
    errNoEncoder: 'Browser ini tidak bisa membuat MP4. Gunakan Safari 16.4+ atau Chrome terbaru.',
    errNoFormat: 'Browser tidak mendukung encoding H.264 untuk format ini.',
    noPoints: 'File tidak mengandung titik lokasi yang bisa dipakai.',
    sampleFail: 'Sample gagal diparse: {msg}',
    parseFail: 'Tidak ada file yang bisa diparse ({count} file gagal).',
    ok: '✓ {name} — {points} titik',
    errHint_legacy:
      'Format Google Takeout lama. Export ulang dari HP: Setelan → Lokasi → Layanan lokasi → Timeline → Export data Timeline',
    errHint_raw: 'Berisi raw signals tanpa data perjalanan. Export ulang dari HP.',
    errHint_unsupported: 'Bukan Timeline.json dari Google Maps (format tidak dikenali).',
    errHint_empty: 'Tidak ada titik lokasi yang bisa dipakai.',
    errHint_malformed: 'File rusak / bukan JSON valid.',
    langToggle: '🌐 English',
  },

  en: {
    tagline: 'turn your Google Maps Timeline into a travel video · 100% on your device',
    heroTitle: 'Timeline Video Generator',
    heroSub:
      'Upload Timeline.json from Google Maps — pick a multi-year range, set your marker 🎯 route color 🎨 dark map 🌑, and export a post-ready MP4. Your file is never uploaded to a server.',
    fileTitle: '1 · Choose Timeline file',
    multiFileNote:
      'You can pick several files at once (from multiple Google accounts) — they are merged automatically.',
    chooseFile: '📁 Choose Timeline.json',
    sample: '✨ Try a sample journey',
    noFile: 'No file loaded',
    loaded: '✓ {count} file(s) loaded: {name}',
    helpSummary: 'How to export Timeline from Google Maps',
    helpStep1: 'Open Google Maps → tap your profile picture.',
    helpStep2: 'Settings → Personal content.',
    helpStep3: 'Export Timeline data → save Timeline.json.',
    helpStep4: 'Come back here and pick the file(s).',
    settingsTitle: '2 · Plan your journey',
    changeFile: '↺ Change file',
    loadedSummary: '✓ {name} · {points} location points · {months} months of data',
    rangeLabel: 'Date range (multi-year)',
    exactDates: 'Select exact dates',
    fromMonth: 'From month',
    toMonth: 'To month',
    selectedSummary: '{period} · {points} points selected',
    videoTitle: 'Video title',
    duration: 'Duration',
    seconds: '{n} seconds',
    camera: 'Camera movement',
    cameraFixed: 'Fixed zoom',
    cameraSteady: 'Steady following',
    cameraDynamic: 'Dynamic following',
    format: 'Video format',
    fmtStandard: 'Square · 480p',
    fmtHigh: 'Square · 720p',
    fmtUltra: 'Square · 1080p',
    fmtPortrait: 'Portrait · 1080×1920',
    fmtLandscape: 'Landscape · 1920×1080',
    mapStyle: 'Map style',
    routeColor: 'Route color',
    marker: 'Marker',
    emojiMarker: 'Choose marker emoji',
    photoMarker: 'Photo marker (auto-cropped to a circle)',
    choosePhoto: '🖼️ Choose photo',
    consent:
      'I understand: my Timeline file is never uploaded, but map tiles are fetched from CARTO (OpenStreetMap) for the route area — this can reveal journey locations to the tile provider.',
    previewBtn: '▶️ Preview',
    preparing: '⏳ Preparing…',
    previewTitle: '3 · Preview & export',
    compatWarn: '⚠️ This browser cannot encode video (needs Safari 16.4+ / Chrome)',
    play: '▶️ Play',
    pause: '⏸ Pause',
    exportBtn: '🎬 Create MP4 ({format})',
    encoding: 'encoding MP4…',
    cancel: 'Cancel',
    download: '⬇️ Download MP4',
    share: '📤 Share',
    bmc: '☕ Buy me a coffee',
    footerNote:
      'All processing happens on your device · Map © OpenStreetMap contributors & CARTO',
    errConsent:
      'Please check the map consent first — map tiles are fetched from CARTO (OpenStreetMap).',
    errTooFew: 'Pick a range that contains at least 2 location points.',
    errPrepare: 'Failed to prepare the journey.',
    errExport: 'Failed to create the video.',
    errNoEncoder: 'This browser cannot create MP4. Use Safari 16.4+ or a recent Chrome.',
    errNoFormat: 'This browser cannot encode H.264 for this format.',
    noPoints: 'The file contains no usable location points.',
    sampleFail: 'Sample failed to parse: {msg}',
    parseFail: 'No file could be parsed ({count} file(s) failed).',
    ok: '✓ {name} — {points} points',
    errHint_legacy:
      'Older Google Takeout format. Re-export from your phone: Settings → Location → Location services → Timeline → Export Timeline data',
    errHint_raw: 'Contains raw signals but no reconstructed journeys. Re-export from your phone.',
    errHint_unsupported: 'Not a Google Maps Timeline.json (unknown format).',
    errHint_empty: 'No usable location points.',
    errHint_malformed: 'Broken file / not valid JSON.',
    langToggle: '🌐 Indonesia',
  },
}

export function makeT(lang) {
  return (key, vars) => {
    let s = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
    }
    return s
  }
}

// Link pembayaran / support — Lynk.id
export const BMC_URL = 'https://lynk.id/najnaj/s/58x34o6w454x'
