import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HOW_TOS, SITE_URL } from '../howto-data'
import { BMC_URL } from '../i18n'
import '../index.css'

export default function HowToPage({ slug }) {
  const page = HOW_TOS.find((h) => h.slug === slug)
  const location = useLocation()

  useEffect(() => {
    document.title = page.metaTitle
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) metaDesc.setAttribute('content', page.metaDescription)
    const metaRobots = document.querySelector('meta[name="robots"]')
    if (metaRobots) metaRobots.setAttribute('content', 'index, follow')

    // Inject JSON-LD HowTo
    let script = document.getElementById('howto-ld')
    if (script) script.remove()
    script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'howto-ld'
    script.textContent = JSON.stringify(page.jsonLd)
    document.head.appendChild(script)

    // Set canonical for this page
    let link = document.querySelector('link[rel="canonical"]')
    if (link) link.setAttribute('href', `${SITE_URL}/how-to/${page.slug}`)
  }, [page])

  if (!page) {
    return (
      <div className="howto-wrapper">
        <div className="howto-container">
          <h1>Halaman tidak ditemukan</h1>
          <p>Kembali ke <Link to="/">aplikasi utama</Link>.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="howto-wrapper">
      <nav className="topbar">
        <div className="logo monog">
          <Link to="/" className="logo-link">
            <span className="logo-mark">🎬</span> timeline<span className="logo-accent">.video</span>
          </Link>
        </div>
        <div className="topbar-note monog">panduan cara pakai</div>
        <div className="topbar-right">
          <a className="btn btn-bmc" href={BMC_URL} target="_blank" rel="noopener noreferrer">
            ☕ Buy me a coffee
          </a>
          <Link to="/" className="btn btn-primary btn-sm">
            🚀 Buka Aplikasi
          </Link>
        </div>
      </nav>

      <main className="howto-container">
        <nav className="howto-breadcrumb monog">
          <Link to="/">Home</Link> &rsaquo; {page.breadcrumb}
        </nav>

        <article>
          <h1>{page.title}</h1>
          <p className="howto-intro">{page.intro}</p>

          <div className="howto-steps">
            {page.steps.map((step, i) => (
              <div className="step-card" key={i}>
                <div className="step-number monog">{i + 1}</div>
                <div className="step-icon">{step.icon}</div>
                <div className="step-body">
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          {page.tips.length > 0 && (
            <div className="howto-tips">
              <h2>💡 Tips</h2>
              <ul>
                {page.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {page.faq.length > 0 && (
            <div className="howto-faq">
              <h2>❓ Tanya Jawab</h2>
              {page.faq.map((item, i) => (
                <details className="faq-item" key={i}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          )}

          <div className="cta-box">
            <h2>Siap mencoba? 🚀</h2>
            <p>Upload Timeline.json kamu dan buat video perjalanan dalam hitungan menit — gratis, 100% on-device.</p>
            <Link to="/" className="btn btn-primary btn-big">Buka Timeline Video Generator →</Link>
          </div>
        </article>

        <aside className="howto-sidebar">
          <h3 className="monog">📖 Panduan Lainnya</h3>
          <ul className="howto-sidebar-links">
            {HOW_TOS.filter((h) => h.slug !== page.slug).map((h) => (
              <li key={h.slug}>
                <Link to={`/how-to/${h.slug}`}>{h.title}</Link>
              </li>
            ))}
            <li><Link to="/">⬅️ Kembali ke aplikasi</Link></li>
          </ul>
          <a className="btn btn-bmc" href={BMC_URL} target="_blank" rel="noopener noreferrer" style={{marginTop: 20, display: 'inline-block'}}>
            ☕ Dukung proyek ini
          </a>
        </aside>
      </main>

      <footer className="foot">
        <a className="btn btn-bmc foot-bmc" href={BMC_URL} target="_blank" rel="noopener noreferrer">
          ☕ Buy me a coffee
        </a>
        <span className="monog">Data diproses 100% di perangkatmu · Map © OpenStreetMap contributors & CARTO</span>
      </footer>
    </div>
  )
}