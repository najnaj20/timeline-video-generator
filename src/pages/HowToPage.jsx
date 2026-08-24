import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HOW_TOS, SITE_URL } from '../howto-data'
import { BMC_URL } from '../i18n'
import { useLang } from '../lang-context'
import '../index.css'

export default function HowToPage({ slug }) {
  const page = HOW_TOS.find((h) => h.slug === slug)
  const location = useLocation()
  const { lang, setLang, t } = useLang()
  const c = page ? page[lang] || page.en : null

  useEffect(() => {
    if (!page || !c) return
    document.title = c.metaTitle
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) metaDesc.setAttribute('content', c.metaDescription)
    const metaRobots = document.querySelector('meta[name="robots"]')
    if (metaRobots) metaRobots.setAttribute('content', 'index, follow')

    // Inject JSON-LD HowTo
    let script = document.getElementById('howto-ld')
    if (script) script.remove()
    script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'howto-ld'
    script.textContent = JSON.stringify(c.jsonLd)
    document.head.appendChild(script)

    // Set canonical for this page
    let link = document.querySelector('link[rel="canonical"]')
    if (link) link.setAttribute('href', `${SITE_URL}/how-to/${page.slug}`)
  }, [page, c, lang])

  if (!page || !c) {
    return (
      <div className="howto-wrapper">
        <div className="howto-container">
          <h1>{t('howtoNotFound')}</h1>
          <p>
            <Link to="/">← Home</Link>
          </p>
        </div>
      </div>
    )
  }

  const otherPages = HOW_TOS.filter((h) => h.slug !== slug)

  return (
    <div className="howto-wrapper">
      <nav className="topbar">
        <div className="logo monog">
          <Link to="/" className="logo-link">
            <span className="logo-mark">🎬</span> timeline<span className="logo-accent">.video</span>
          </Link>
        </div>
        <div className="topbar-note monog">{t('howtoNav')}</div>
        <div className="topbar-right">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setLang((l) => (l === 'id' ? 'en' : 'id'))}
            title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
          >
            🌐 {lang === 'id' ? 'English' : 'Indonesia'}
          </button>
          <a className="btn btn-bmc" href={BMC_URL} target="_blank" rel="noopener noreferrer">
            ☕ Buy me a coffee
          </a>
          <Link to="/" className="btn btn-primary btn-sm">
            {t('openApp')}
          </Link>
        </div>
      </nav>

      <main className="howto-container">
        <nav className="howto-breadcrumb monog">
          <Link to="/">{t('howtoHome')}</Link> &rsaquo; {c.breadcrumb}
        </nav>

        <article>
          <h1>{c.title}</h1>
          <p className="howto-intro">{c.intro}</p>

          <div className="howto-steps">
            {c.steps.map((step, i) => (
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

          {c.tips.length > 0 && (
            <div className="howto-tips">
              <h2>{t('howtoTips')}</h2>
              <ul>
                {c.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {c.faq.length > 0 && (
            <div className="howto-faq">
              <h2>{t('howtoFaq')}</h2>
              {c.faq.map((item, i) => (
                <details className="faq-item" key={i}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          )}

          <div className="cta-box">
            <h2>{t('howtoCtaTitle')}</h2>
            <p>{t('howtoCtaText')}</p>
            <Link to="/" className="btn btn-primary btn-big">
              {t('howtoCtaBtn')}
            </Link>
          </div>
        </article>

        <aside className="howto-sidebar">
          <h3 className="monog">{t('howtoSidebar')}</h3>
          <ul className="howto-sidebar-links">
            {otherPages.map((h) => {
              const hc = h[lang] || h.en
              return (
                <li key={h.slug}>
                  <Link to={`/how-to/${h.slug}`}>{hc.title}</Link>
                </li>
              )
            })}
            <li>
              <Link to="/">{t('howtoBack')}</Link>
            </li>
          </ul>
          <a
            className="btn btn-bmc"
            href={BMC_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: 20, display: 'inline-block' }}
          >
            {t('howtoSupport')}
          </a>
        </aside>
      </main>

      <footer className="foot">
        <a className="btn btn-bmc foot-bmc" href={BMC_URL} target="_blank" rel="noopener noreferrer">
          ☕ Buy me a coffee
        </a>
        <span className="monog">{t('footerNote')}</span>
      </footer>
    </div>
  )
}