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
import { detectLang, makeT, BMC_URL, LOCALES } from './i18n'
import './index.css'

const MARKER_EMOJI_PRESETS = ['📍', '🚗', '✈️', '🏍️', '🚢', '🚀', '🏖️', '⛰️', '🏙️', '🌋', '🎯', '❤️']

function formatPeriod(points, locale) {
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
  const [lang, setLang] = useState(detectLang)
  const t = useMemo(() => makeT(lang), [lang])
  const locale = LOCALES.find((l) => l.id === lang)?.intl || 'id-ID'

  useEffect(() => {
    document.documentElement.lang = lang === 'id' ? 'id' : 'en'
  }, [lang])

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
  const [status, setStatus] = useState('idle') // idle | ready | preparing | preview | exporting | done
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
    () => (points ? availableMonths(points, locale) : []),
    [points, locale]
  )

  const filtered = useMemo(() => {
    if (!points) return []
    if (rangeMode === 'exact') {
      return startDate && endDate ? selectDateRange(points, startDate, endDate) : []
    }
    return startMonth && endMonth ? selectRange(points, startMonth, endMonth) : []
  }, [points, rangeMode, startMonth, endMonth, startDate, endDate])

  const periodLabel = useMemo(() => formatPeriod(filtered, locale), [filtered, locale])
  const format = VIDEO_FORMATS.find((f) => f.key === formatKey)

  const applyLoadedPoints = (merged, label, count) => {
    if (merged.length === 0) {
      setParseError(t('noPoints'))
      return
    }
    setPoints(merged)
    setFileName(label)
    setFileCount(count)
    setParseError('')
    const m = availableMonths(merged, locale)
    setStartMonth(m[0]?.key || '')
    setEndMonth(m[m.length - 1]?.key || '')
    const first = merged[0].instant
    const last = merged[merged.length - 1].instant
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    setStartDate(iso(first))
    setEndDate(iso(last))
    setStatus('ready')
  }

  const describeResults = (results) =>
    results.map((r) =>
      r.ok
        ? t('ok', { name: r.name, points: r.parsed.length.toLocaleString(locale) })
        : `✗ ${r.name} — ${t(`errHint_${r.reason}`)}`
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
      setParseError(t('parseFail', { count: results.length }))
      return
    }
    const arrays = okResults.map((r) => r.parsed)
    const label = files.length === 1 ? files[0].name : t('loaded', { count: files.length, name: '' }).replace('✓ ', '').replace(/:\s*$/, '')
    setFileDetail(describeResults(results))
    applyLoadedPoints(mergePoints(arrays), label, files.length)
  }

  const loadSample = () => {
    setError('')
    try {
      const parsed = parseTimelineJson(sampleTimeline)
      setFileDetail([t('ok', { name: 'sample-timeline.json', points: parsed.length.toLocaleString(locale) })])
      applyLoadedPoints(parsed, 'sample-timeline.json', 1)
    } catch (e) {
      setParseError(t('sampleFail', { msg: e.message }))
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
      setError(t('errTooFew'))
      return
    }
    if (!consentRef.current?.checked) {
      setError(t('errConsent'))
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
      console.error('[TimelineVideoGen] preview gagal:', e)
      setError(`${t('errPrepare')} ${e.message || ''}`)
      setStatus('ready')
    }
  }

  const exportVideo = async () => {
    if (!journey || status !== 'preview') return
    setError('')
    const resolved = resolveVideoFormat(formatKey, videoSupport)
    if (!resolved) {
      setError(t('errNoFormat'))
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
      setError(`${t('errExport')} ${e.message || ''}`)
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

  const formatLabel = (key) =>
    t({ standard: 'fmtStandard', high: 'fmtHigh', ultra: 'fmtUltra', portrait: 'fmtPortrait', landscape: 'fmtLandscape' }[key])

  return (
    <div className="app">
      <nav className="topbar">
        <div className="logo monog">
          <span className="logo-mark">🎬</span> timeline<span className="logo-accent">.video</span>
        </div>
        <div className="topbar-note monog">{t('tagline')}</div>
        <div className="topbar-right">
          <a className="btn btn-bmc" href={BMC_URL} target="_blank" rel="noopener noreferrer">
            {t('bmc')}
          </a>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setLang((l) => (l === 'id' ? 'en' : 'id'))}
            title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
          >
            {t('langToggle')}
          </button>
        </div>
      </nav>

      <header className="hero">
        <h1 className="hero-title">
          Timeline <span className="grad-text">Video Generator</span>
        </h1>
        <p className="hero-sub">{t('heroSub')}</p>
      </header>

      {status === 'idle' && (
        <section className="card file-card">
          <h2>{t('fileTitle')}</h2>
          <p className="dim">{t('multiFileNote')}</p>
          <div className="file-actions">
            <label className="btn btn-primary file-btn">
              {t('chooseFile')}
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
              {t('sample')}
            </button>
          </div>
          <p className="status monog">
            {fileName ? t('loaded', { count: fileCount, name: fileName }) : t('noFile')}
          </p>
          {parseError && <p className="error">{parseError}</p>}
          <details className="help-panel">
            <summary className="monog">{t('helpSummary')}</summary>
            <ol>
              <li>{t('helpStep1')}</li>
              <li>{t('helpStep2')}</li>
              <li>{t('helpStep3')}</li>
              <li>{t('helpStep4')}</li>
            </ol>
          </details>
        </section>
      )}

      {status !== 'idle' && (
        <section className="card">
          <div className="card-head">
            <h2>{t('settingsTitle')}</h2>
            <div className="card-head-right">
              <span className="phase-badge monog" data-phase={status}>{status}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => { setStatus('idle'); setPoints(null); setJourney(null); setResultUrl('') }}>
                {t('changeFile')}
              </button>
            </div>
          </div>
          <p className="status monog">
            {t('loadedSummary', { name: fileName, points: points.length.toLocaleString(locale), months: months.length })}
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
              <label className="monog">{t('rangeLabel')}</label>
              <label className="checkbox-row">
                <input type="checkbox" checked={rangeMode === 'exact'} onChange={(e) => setRangeMode(e.target.checked ? 'exact' : 'month')} />
                <span>{t('exactDates')}</span>
              </label>
              {rangeMode === 'month' ? (
                <div className="field-row">
                  <select value={startMonth} onChange={(e) => setStartMonth(e.target.value)} aria-label={t('fromMonth')}>
                    {months.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
                  </select>
                  <span className="dim">–</span>
                  <select value={endMonth} onChange={(e) => setEndMonth(e.target.value)} aria-label={t('toMonth')}>
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
              <span className="field-hint monog">
                {t('selectedSummary', { period: periodLabel, points: filtered.length.toLocaleString(locale) })}
              </span>
            </div>

            <div className="field">
              <label className="monog">{t('videoTitle')}</label>
              <input type="text" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="My Journey" />
            </div>
          </div>

          <div className="grid-3">
            <div className="field">
              <label className="monog">{t('duration')}</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                {['10', '15', '20', '30', '45', '60'].map((d) => <option key={d} value={d}>{t('seconds', { n: d })}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="monog">{t('camera')}</label>
              <select value={camera} onChange={(e) => setCamera(e.target.value)}>
                <option value="fixed">{t('cameraFixed')}</option>
                <option value="steady">{t('cameraSteady')}</option>
                <option value="dynamic">{t('cameraDynamic')}</option>
              </select>
            </div>
            <div className="field">
              <label className="monog">{t('format')}</label>
              <select value={formatKey} onChange={(e) => setFormatKey(e.target.value)}>
                {VIDEO_FORMATS.map((f) => <option key={f.key} value={f.key}>{formatLabel(f.key)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid-3">
            <div className="field">
              <label className="monog">{t('mapStyle')}</label>
              <div className="pill-group">
                {MAP_STYLES.map((s) => (
                  <button key={s.id} className={`pill ${mapStyle === s.id ? 'active' : ''}`} onClick={() => setMapStyle(s.id)}>
                    {s.id === 'dark' ? '🌑' : '☀️'} {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="monog">{t('routeColor')}</label>
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
              <label className="monog">{t('marker')}</label>
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
              <label className="monog">{t('emojiMarker')}</label>
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
              <label className="monog">{t('photoMarker')}</label>
              <label className="btn btn-ghost btn-sm file-btn">
                {t('choosePhoto')}
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
            <span>{t('consent')}</span>
          </label>

          {error && <p className="error">{error}</p>}

          <div className="actions">
            <button className="btn btn-primary btn-big" onClick={runPreview} disabled={status === 'preparing'}>
              {status === 'preparing' ? t('preparing') : t('previewBtn')}
            </button>
          </div>
        </section>
      )}

      {(status === 'preview' || status === 'exporting' || status === 'done') && journey && (
        <section className="card preview-card">
          <div className="card-head">
            <h2>{t('previewTitle')}</h2>
            {!hasVideoEncoder() && <span className="warn">{t('compatWarn')}</span>}
          </div>

          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="preview-canvas"
          />

          <div className="preview-controls">
            <button className="btn btn-ghost btn-sm" onClick={() => setPlaying((p) => !p)}>
              {playing ? t('pause') : t('play')}
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
                <span className="monog dim">{t('encoding')}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => abortRef.current?.abort()}>{t('cancel')}</button>
              </div>
            ) : (
              <button className="btn btn-primary btn-big" onClick={exportVideo} disabled={!videoSupport?.get(formatKey)}>
                {t('exportBtn', { format: formatLabel(formatKey) })}
              </button>
            )}
          </div>

          {status === 'done' && resultUrl && (
            <div className="result">
              <video src={resultUrl} controls playsInline className="result-video" />
              <div className="result-actions">
                <a className="btn btn-primary" href={resultUrl} download={`timeline-journey-${Date.now()}.mp4`}>
                  {t('download')}
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
                  {t('share')}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <footer className="foot">
        <a className="btn btn-bmc foot-bmc" href={BMC_URL} target="_blank" rel="noopener noreferrer">
          {t('bmc')}
        </a>
        <span className="monog">{t('footerNote')}</span>
      </footer>
    </div>
  )
}
