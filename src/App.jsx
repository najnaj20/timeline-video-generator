import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { parseTimelineJson, availableMonths, selectRange, selectDateRange } from './lib/timeline'
import { frameAtOverallProgress } from './lib/animation'
import {
  prepareJourney,
  drawFrame,
  previewCanvasSize,
  ROUTE_COLORS,
  MAP_STYLES,
  MARKER_TYPES,
} from './lib/renderer'
import {
  createJourneyMp4,
  probeVideoFormats,
  resolveVideoFormat,
  VIDEO_FORMATS,
  hasVideoEncoder,
} from './lib/video'
import sampleTimeline from './data/sample-timeline.json'
import './index.css'

const MARKER_EMOJI_PRESETS = ['📍', '🚗', '✈️', '🏍️', '🚢', '🚀', '🏖️', '⛰️', '🏙️', '🌋', '🎯', '❤️']

function formatPeriod(points, locale = 'id-ID') {
  if (!points || points.length === 0) return ''
  const fmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' })
  const first = fmt.format(points[0].instant)
  const last = fmt.format(points[points.length - 1].instant)
  return first === last ? first : `${first} – ${last}`
}

function mergePoints(arrays) {
  const unique = new Map()
  for (const points of arrays) {
    for (const point of points) {
      unique.set(`${point.instant.getTime()}|${point.latitude}|${point.longitude}`, point)
    }
  }
  return [...unique.values()].sort((a, b) => a.instant.getTime() - b.instant.getTime())
}

export default function App() {
  const [points, setPoints] = useState(null) // semua titik dari file (merged)
  const [fileName, setFileName] = useState('')
  const [fileCount, setFileCount] = useState(0)
  const [fileDetail, setFileDetail] = useState([])
  const [parseError, setParseError] = useState('')

  // Rentang tanggal (multi-tahun)
  const [rangeMode, setRangeMode] = useState('month') // 'month' | 'exact'
  const [startMonth, setStartMonth] = useState('')
  const [endMonth, setEndMonth] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Pengaturan video
  const [title, setTitle] = useState('My Journey')
  const [duration, setDuration] = useState('30')
  const [camera, setCamera] = useState('steady')
  const [formatKey, setFormatKey] = useState('standard')
  const [mapStyle, setMapStyle] = useState('light')
  const [routeColor, setRouteColor] = useState('pink')
  const [markerType, setMarkerType] = useState('circle')
  const [markerEmoji, setMarkerEmoji] = useState('📍')
  const [markerPhotoData, setMarkerPhotoData] = useState('')
  const [recap, setRecap] = useState(true)
  const [videoSupport, setVideoSupport] = useState(null)
  const [status, setStatus] = useState('idle') // idle | preparing | preview | exporting | done
  const [journey, setJourney] = useState(null)
  const [previewProgress, setPreviewProgress] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [resultUrl, setResultUrl] = useState('')
  const [error, setError] = useState('')

  const canvasRef = useRef(null)
  const exportCanvasRef = useRef(null)
  const photoImgRef = useRef(null)
  const consentRef = useRef(null)
  const blobRef = useRef(null)
  const abortRef = useRef(null)
  const rafRef = useRef(null)
  const playingRef = useRef(false)
  const progressRef = useRef(0)

  // Probing kemampuan video saat pertama render
  useEffect(() => {
    probeVideoFormats().then(setVideoSupport)
  }, [])

  // Muat foto marker → HTMLImageElement
  useEffect(() => {
    if (markerType !== 'photo' || !markerPhotoData) {
      photoImgRef.current = null
      return
    }
    const img = new Image()
    img.onload = () => {
      photoImgRef.current = img
    }
    img.src = markerPhotoData
  }, [markerType, markerPhotoData])

  const months = useMemo(
    () => (points ? availableMonths(points, 'id-ID') : []),
    [points]
  )

  const filtered = useMemo(() => {
    if (!points) return []
    if (rangeMode === 'exact') {
      return startDate && endDate ? selectDateRange(points, startDate, endDate) : []
    }
    return startMonth && endMonth ? selectRange(points, startMonth, endMonth) : []
  }, [points, rangeMode, startMonth, endMonth, startDate, endDate])

  const periodLabel = useMemo(() => formatPeriod(filtered), [filtered])
  const format = VIDEO_FORMATS.find((f) => f.key === formatKey)

  const applyLoadedPoints = (merged, label, count) => {
    if (merged.length === 0) {
      setParseError('File tidak mengandung titik lokasi yang bisa dipakai.')
      return
    }
    setPoints(merged)
    setFileName(label)
    setFileCount(count)
    setParseError('')
    const m = availableMonths(merged, 'id-ID')
    setStartMonth(m[0]?.key || '')
    setEndMonth(m[m.length - 1]?.key || '')
    const first = merged[0].instant
    const last = merged[merged.length - 1].instant
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    setStartDate(iso(first))
    setEndDate(iso(last))
    setStatus('ready')
  }

  const FILE_ERROR_HINTS = {
    'legacy-format': 'Format Google Takeout lama. Export ulang dari HP: Setelan → Lokasi → Layanan lokasi → Timeline → Export data Timeline',
    'raw-signals-only': 'Berisi raw signals tanpa data perjalanan. Export ulang dari HP.',
    'unsupported-format': 'Bukan Timeline.json dari Google Maps (format tidak dikenali).',
    'no-usable-locations': 'Tidak ada titik lokasi yang bisa dipakai.',
    'malformed-json': 'File rusak / bukan JSON valid.',
  }

  const describeResults = (results) =>
    results.map((r) =>
      r.ok
        ? `✓ ${r.name} — ${r.parsed.length.toLocaleString('id-ID')} titik`
        : `✗ ${r.name} — ${FILE_ERROR_HINTS[r.reason] || r.message}`
    )

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return
    setError('')
    const results = []
    for (const file of files) {
      try {
        const text = await file.text()
        const parsed = parseTimelineJson(JSON.parse(text))
        results.push({ name: file.name, ok: true, parsed })
      } catch (e) {
        results.push({
          name: file.name,
          ok: false,
          reason: e.reason || 'malformed-json',
          message: e.message,
        })
        console.error('[TimelineVideoGen] gagal parse:', file.name, e)
      }
    }
    const okResults = results.filter((r) => r.ok)
    if (okResults.length === 0) {
      setFileDetail(describeResults(results))
      setParseError(`Tidak ada file yang bisa diparse (${results.length} file gagal).`)
      return
    }
    const arrays = okResults.map((r) => r.parsed)
    const label = files.length === 1 ? files[0].name : `${files.length} file digabung`
    setFileDetail(describeResults(results))
    applyLoadedPoints(mergePoints(arrays), label, files.length)
  }

  const loadSample = () => {
    setError('')
    try {
      const parsed = parseTimelineJson(sampleTimeline)
      setFileDetail([`✓ sample-timeline.json — ${parsed.length.toLocaleString('id-ID')} titik`])
      applyLoadedPoints(parsed, 'sample-timeline.json', 1)
    } catch (e) {
      setParseError(`Sample gagal diparse: ${e.message}`)
    }
  }

  const stopAnimation = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    playingRef.current = false
    setPlaying(false)
  }

  const drawLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !journey) return
    const total = Number(duration)
    const frame = frameAtOverallProgress(progressRef.current, total)
    drawFrame(canvas, journey, frame, { title: title || 'My Journey', periodLabel })
    if (playingRef.current) {
      progressRef.current += 1 / (total * 60) // ~60fps
      if (progressRef.current >= 1) progressRef.current = 0
      setPreviewProgress(progressRef.current)
      rafRef.current = requestAnimationFrame(drawLoop)
    }
  }, [journey, duration, title, periodLabel])

  useEffect(() => {
    if (!journey) return
    if (playing) {
      playingRef.current = true
      rafRef.current = requestAnimationFrame(drawLoop)
    } else {
      stopAnimation()
      const canvas = canvasRef.current
      if (canvas) {
        const frame = frameAtOverallProgress(progressRef.current, Number(duration))
        drawFrame(canvas, journey, frame, { title: title || 'My Journey', periodLabel })
      }
    }
    return stopAnimation
  }, [playing, journey, drawLoop, duration, title, periodLabel])

  const seekPreview = (value) => {
    progressRef.current = Number(value)
    setPreviewProgress(progressRef.current)
    if (canvasRef.current && journey) {
      const frame = frameAtOverallProgress(progressRef.current, Number(duration))
      drawFrame(canvasRef.current, journey, frame, { title: title || 'My Journey', periodLabel })
    }
  }

  const runPreview = async () => {
    setError('')
    if (filtered.length < 2) {
      setError('Pilih rentang yang berisi minimal 2 titik lokasi.')
      return
    }
    if (!consentRef.current?.checked) {
      setError('Centang persetujuan peta dulu — tile peta dimuat dari CARTO (OpenStreetMap).')
      return
    }
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setStatus('preparing')
    try {
      const marker = {
        type: markerType,
        emoji: markerEmoji,
        photo: photoImgRef.current,
      }
      const prepared = await prepareJourney(
        filtered,
        { width: format.width, height: format.height },
        camera,
        Number(duration),
        { mapStyle, routeColor, marker, recap },
        controller.signal,
      )
      setJourney(prepared)
      progressRef.current = 0
      setPreviewProgress(0)
      setStatus('preview')
      setPlaying(true)
    } catch (e) {
      if (e.name === 'AbortError') return
      setError(e.message || 'Gagal menyiapkan perjalanan.')
      setStatus('ready')
    }
  }

  const exportVideo = async () => {
    if (!journey || status !== 'preview') return
    setError('')
    const resolved = resolveVideoFormat(formatKey, videoSupport)
    if (!resolved) {
      setError('Browser tidak mendukung encoding H.264 untuk format ini. Coba format lebih kecil atau Safari/Chrome terbaru.')
      return
    }
    if (!exportCanvasRef.current) exportCanvasRef.current = document.createElement('canvas')
    const canvas = exportCanvasRef.current
    canvas.width = resolved.width
    canvas.height = resolved.height
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setStatus('exporting')
    setExportProgress(0)
    try {
      const marker = {
        type: markerType,
        emoji: markerEmoji,
        photo: photoImgRef.current,
      }
      const style = { mapStyle, routeColor, marker, recap }
      const blob = await createJourneyMp4(canvas, { ...journey, style }, {
        durationSeconds: Number(duration),
        overlay: { title: title || 'My Journey', periodLabel },
        format: resolved,
        onProgress: (fraction) => setExportProgress(fraction),
        signal: controller.signal,
      })
      blobRef.current = blob
      if (resultUrl) URL.revokeObjectURL(resultUrl)
      setResultUrl(URL.createObjectURL(blob))
      setStatus('done')
      console.log('[TimelineVideoGen] MP4 export sukses:', (blob.size / 1024).toFixed(0), 'KB')
    } catch (e) {
      if (e.name === 'AbortError') return
      console.error('[TimelineVideoGen] export gagal:', e)
      setError(e.message || 'Gagal membuat video.')
      setStatus('preview')
    }
  }

  const canvasSize = format
    ? previewCanvasSize(
        { width: format.width, height: format.height },
        typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 520) : 480,
        typeof window !== 'undefined' ? window.devicePixelRatio : 1,
      )
    : { width: 480, height: 480 }

  const formatLabel = (key) => {
    const map = {
      standard: 'Kotak · 480p',
      high: 'Kotak · 720p',
      ultra: 'Kotak · 1080p',
      portrait: 'Portrait · 1080×1920',
      landscape: 'Landscape · 1920×1080',
    }
    return map[key] || key
  }

  return (
    <div className="app">
      <nav className="topbar">
        <div className="logo monog">
          <span className="logo-mark">🎬</span> timeline<span className="logo-accent">.video</span>
        </div>
        <div className="topbar-note monog">ubah Timeline Google Maps jadi video perjalanan · 100% di perangkatmu</div>
      </nav>

      <header className="hero">
        <h1 className="hero-title">
          Timeline <span className="grad-text">Video Generator</span>
        </h1>
        <p className="hero-sub">
          Upload <span className="monog">Timeline.json</span> dari Google Maps — pilih rentang
          multi-tahun, atur marker 🎯 warna rute 🎨 map dark 🌑, dan export MP4 siap post.
          File tidak pernah di-upload ke server.
        </p>
      </header>

      {status === 'idle' && (
        <section className="card file-card">
          <h2>1 · Pilih file Timeline</h2>
          <p className="dim">
            Bisa pilih <b>beberapa file sekaligus</b> (dari beberapa akun Google) — nanti digabung otomatis.
          </p>
          <div className="file-actions">
            <label className="btn btn-primary file-btn">
              📁 Pilih Timeline.json
              <input
                type="file"
                accept="application/json,.json"
                multiple
                onChange={(e) => {
                  handleFiles(e.target.files)
                  e.target.value = ''
                }}
              />
            </label>
            <button className="btn btn-ghost" onClick={loadSample}>
              ✨ Coba sample perjalanan
            </button>
          </div>
          <p className="status monog">{fileName ? `✓ ${fileCount} file dimuat: ${fileName}` : 'Belum ada file dimuat'}</p>
          {parseError && <p className="error">{parseError}</p>}
          <details className="help-panel">
            <summary className="monog">Cara export Timeline dari Google Maps</summary>
            <ol>
              <li>Buka Google Maps → tap foto profil.</li>
              <li>Setelan → Konten pribadi.</li>
              <li>Export data Timeline → simpan <span className="monog">Timeline.json</span>.</li>
              <li>Balik ke sini, pilih file-nya.</li>
            </ol>
          </details>
        </section>
      )}

      {status !== 'idle' && (
        <section className="card">
          <div className="card-head">
            <h2>2 · Atur perjalanan</h2>
            <div className="card-head-right">
              <span className="phase-badge monog" data-phase={status}>{status}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => { setStatus('idle'); setPoints(null); setJourney(null); setResultUrl('') }}>
                ↺ Ganti file
              </button>
            </div>
          </div>
          <p className="status monog">
            ✓ {fileName} · {points.length.toLocaleString('id-ID')} titik lokasi · {months.length} bulan data
          </p>
          {fileDetail.length > 0 && (
            <ul className="file-detail monog">
              {fileDetail.map((line, i) => (
                <li key={i} className={line.startsWith('✗') ? 'file-detail-bad' : ''}>{line}</li>
              ))}
            </ul>
          )}

          <div className="grid-2">
            <div className="field">
              <label className="monog">Rentang tanggal (multi-tahun)</label>
              <label className="checkbox-row">
                <input type="checkbox" checked={rangeMode === 'exact'} onChange={(e) => setRangeMode(e.target.checked ? 'exact' : 'month')} />
                <span>Pilih tanggal spesifik</span>
              </label>
              {rangeMode === 'month' ? (
                <div className="field-row">
                  <select value={startMonth} onChange={(e) => setStartMonth(e.target.value)} aria-label="Dari bulan">
                    {months.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
                  </select>
                  <span className="dim">–</span>
                  <select value={endMonth} onChange={(e) => setEndMonth(e.target.value)} aria-label="Sampai bulan">
                    {months.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
                  </select>
                </div>
              ) : (
                <div className="field-row">
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  <span className="dim">–</span>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              )}
              <span className="field-hint monog">{periodLabel} · {filtered.length.toLocaleString('id-ID')} titik dipilih</span>
            </div>

            <div className="field">
              <label className="monog">Judul video</label>
              <input type="text" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="My Journey" />
            </div>
          </div>

          <div className="grid-3">
            <div className="field">
              <label className="monog">Durasi</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                {['10', '15', '20', '30', '45', '60'].map((d) => <option key={d} value={d}>{d} detik</option>)}
              </select>
            </div>
            <div className="field">
              <label className="monog">Gerakan kamera</label>
              <select value={camera} onChange={(e) => setCamera(e.target.value)}>
                <option value="fixed">Fixed zoom</option>
                <option value="steady">Steady following</option>
                <option value="dynamic">Dynamic following</option>
              </select>
            </div>
            <div className="field">
              <label className="monog">Format video</label>
              <select value={formatKey} onChange={(e) => setFormatKey(e.target.value)}>
                {VIDEO_FORMATS.map((f) => <option key={f.key} value={f.key}>{formatLabel(f.key)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid-3">
            <div className="field">
              <label className="monog">Map style</label>
              <div className="pill-group">
                {MAP_STYLES.map((s) => (
                  <button key={s.id} className={`pill ${mapStyle === s.id ? 'active' : ''}`} onClick={() => setMapStyle(s.id)}>
                    {s.id === 'dark' ? '🌑' : '☀️'} {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="monog">Warna rute</label>
              <div className="swatch-row">
                {Object.entries(ROUTE_COLORS).map(([key, c]) => (
                  <button
                    key={key}
                    className={`swatch ${routeColor === key ? 'active' : ''}`}
                    style={{ background: c.main }}
                    onClick={() => setRouteColor(key)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
            <div className="field">
              <label className="monog">Marker</label>
              <div className="pill-group">
                {MARKER_TYPES.map((m) => (
                  <button key={m.id} className={`pill ${markerType === m.id ? 'active' : ''}`} onClick={() => setMarkerType(m.id)}>
                    {m.id === 'circle' ? '⚫' : m.id === 'emoji' ? '😀' : '🖼️'} {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {markerType === 'emoji' && (
            <div className="field">
              <label className="monog">Pilih emoji marker</label>
              <div className="emoji-row">
                {MARKER_EMOJI_PRESETS.map((e) => (
                  <button key={e} className={`emoji-cell ${markerEmoji === e ? 'active' : ''}`} onClick={() => setMarkerEmoji(e)}>
                    {e}
                  </button>
                ))}
                <input type="text" className="emoji-free" value={markerEmoji} maxLength={4} onChange={(e) => setMarkerEmoji(e.target.value)} />
              </div>
            </div>
          )}

          {markerType === 'photo' && (
            <div className="field">
              <label className="monog">Foto marker (otomatis di-crop lingkaran)</label>
              <label className="btn btn-ghost btn-sm file-btn">
                🖼️ Pilih foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = () => setMarkerPhotoData(reader.result)
                      reader.readAsDataURL(file)
                    }
                    e.target.value = ''
                  }}
                />
              </label>
              {markerPhotoData && (
                <img src={markerPhotoData} alt="Marker preview" className="marker-photo-preview" />
              )}
            </div>
          )}

          <label className="checkbox-row consent">
            <input ref={consentRef} type="checkbox" defaultChecked={false} />
            <span>
              Saya paham: file Timeline tidak di-upload, tapi <b>tile peta dimuat dari CARTO</b> (OpenStreetMap)
              untuk area rute — ini bisa mengungkap lokasi perjalanan ke penyedia tile.
            </span>
          </label>

          {error && <p className="error">{error}</p>}

          <div className="actions">
            <button className="btn btn-primary btn-big" onClick={runPreview} disabled={status === 'preparing'}>
              {status === 'preparing' ? '⏳ Menyiapkan…' : '▶️ Preview'}
            </button>
          </div>
        </section>
      )}

      {(status === 'preview' || status === 'exporting' || status === 'done') && journey && (
        <section className="card preview-card">
          <div className="card-head">
            <h2>3 · Preview & export</h2>
            {!hasVideoEncoder() && <span className="warn">⚠️ Browser ini tidak bisa encode video (butuh Safari 16.4+ / Chrome)</span>}
          </div>

          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="preview-canvas"
          />

          <div className="preview-controls">
            <button className="btn btn-ghost btn-sm" onClick={() => setPlaying((p) => !p)}>
              {playing ? '⏸ Pause' : '▶️ Play'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.001"
              value={previewProgress}
              onChange={(e) => seekPreview(e.target.value)}
              className="seek"
              aria-label="Seek preview"
            />
            <span className="monog dim">{Math.round(previewProgress * 100)}%</span>
          </div>

          <div className="actions export-actions">
            {status === 'exporting' ? (
              <div className="export-progress">
                <progress value={exportProgress} max="1" />
                <span className="monog">{Math.round(exportProgress * 100)}%</span>
                <span className="monog dim">encode MP4…</span>
                <button className="btn btn-ghost btn-sm" onClick={() => abortRef.current?.abort()}>Batal</button>
              </div>
            ) : (
              <button className="btn btn-primary btn-big" onClick={exportVideo} disabled={!videoSupport?.get(formatKey)}>
                🎬 Buat MP4 ({formatLabel(formatKey)})
              </button>
            )}
          </div>

          {status === 'done' && resultUrl && (
            <div className="result">
              <video src={resultUrl} controls playsInline className="result-video" />
              <div className="result-actions">
                <a className="btn btn-primary" href={resultUrl} download={`timeline-journey-${Date.now()}.mp4`}>
                  ⬇️ Download MP4
                </a>
                <button
                  className="btn btn-ghost"
                  onClick={async () => {
                    try {
                      const blob = blobRef.current
                      if (!blob || !navigator.canShare?.({ files: [new File([blob], 'journey.mp4', { type: 'video/mp4' })] })) return
                      await navigator.share({ files: [new File([blob], 'timeline-journey.mp4', { type: 'video/mp4' })] })
                    } catch {}
                  }}
                >
                  📤 Share
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <footer className="foot">
        <span className="monog">
          Data diproses 100% di perangkatmu · Map © OpenStreetMap contributors & CARTO · terinspirasi{' '}
          <a href="https://github.com/mahlernim/google-timeline-visualizer" target="_blank" rel="noreferrer">mahlernim/google-timeline-visualizer</a> (MIT)
        </span>
      </footer>
    </div>
  )
}
