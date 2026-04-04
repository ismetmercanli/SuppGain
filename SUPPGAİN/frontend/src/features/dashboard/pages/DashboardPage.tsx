import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/auth-context'
import '../dashboard.css'
import { PATHS } from '../../../shared/router/paths'

const sideMenuItems = [
  { key: 'dashboard', label: 'Panel', route: PATHS.DASHBOARD, icon: '⌂' },
  { key: 'tracking', label: 'Takviye Takibi', route: PATHS.SUPPLEMENT_TRACKING, icon: '◎' },
  { key: 'weekly', label: 'Haftalik Program', route: PATHS.WEEKLY_PROGRAM, icon: '◷' },
  { key: 'products', label: 'Urunler', route: PATHS.PRODUCTS, icon: '◫' },
  { key: 'orders', label: 'Siparislerim', route: PATHS.MY_ORDERS, icon: '▣' },
  { key: 'checkout', label: 'Sepet/Odeme', route: PATHS.CHECKOUT, icon: '◍' },
  { key: 'profile', label: 'Profil', route: PATHS.PROFILE, icon: '◉' },
]

const quickCards = [
  {
    title: 'Canli Takip',
    description: 'Bugunku dozlarini tek ekranda tamamla.',
    route: PATHS.SUPPLEMENT_TRACKING,
    icon: '◎',
  },
  {
    title: 'Haftalik Plan',
    description: 'Satin alimlara gore plan olustur ve duzenle.',
    route: PATHS.WEEKLY_PROGRAM,
    icon: '◷',
  },
  {
    title: 'Urun Katalogu',
    description: 'Takviye sec, stok ve icerikleri karsilastir.',
    route: PATHS.PRODUCTS,
    icon: '◫',
  },
  {
    title: 'Siparisler',
    description: 'Gecmis siparislerini ve durumlarini gor.',
    route: PATHS.MY_ORDERS,
    icon: '▣',
  },
]

const principles = [
  {
    title: 'Duzenli kullanim',
    detail: 'Ayni saatlerde alinan takviyeler takip disiplini olusturur.',
  },
  {
    title: 'Stok takibi',
    detail: 'Dusuk stokta erken yenileme, programin aksamamasini saglar.',
  },
  {
    title: 'Kisisel plan',
    detail: 'Haftalik programa gore kullanim, hedefe uygun surecleri guclendirir.',
  },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, signOut } = useAuth()

  function handleSignOut(): void {
    signOut()
    navigate(PATHS.ROOT, { replace: true })
  }

  return (
    <main className="sg-dashboard">
      <aside className="sg-sidebar">
        <div>
          <p className="sg-logo">SuppGain</p>
          <p className="sg-logo-sub">Supplement Dunyasi</p>
        </div>

        <nav className="sg-nav">
          {sideMenuItems.map((item) => (
            <button
              type="button"
              key={item.key}
              className={`sg-nav-item ${location.pathname === item.route ? 'is-active' : ''}`}
              onClick={() => navigate(item.route)}
            >
              <span className="sg-nav-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button type="button" className="sg-upgrade-btn" onClick={() => navigate(PATHS.SUPPLEMENT_TRACKING)}>
          Bugunu Baslat
        </button>
      </aside>

      <section className="sg-main">
        <header className="sg-topbar">
          <p className="sg-welcome">
            Hedefe odaklan, <span>{session?.user.firstName ?? 'Sporcu'}</span>
          </p>
          <div className="sg-topbar-actions">
            <button type="button" className="sg-ghost-btn" onClick={() => navigate(PATHS.SUPPLEMENT_TRACKING)}>
              ◎ Takibe Git
            </button>
            <button type="button" className="sg-ghost-btn" onClick={handleSignOut}>
              ⇥ Cikis
            </button>
          </div>
        </header>

        <section className="sg-hero">
          <div>
            <h1>Takviyeni planla, takip et, tamamla.</h1>
            <p>
              Bu panel urun, stok ve doz takibini tek akista yonetmen icin tasarlandi.
              Once canli takip ekranindan bugunku alimlarini tamamla.
            </p>
          </div>
          <button type="button" className="sg-live-btn" onClick={() => navigate(PATHS.SUPPLEMENT_TRACKING)}>
            ✦ Canli Takip
          </button>
        </section>

        <section className="sg-grid">
          <div className="sg-left-stack">
            <article className="sg-progress-card sg-focus-card">
              <p className="sg-progress-kicker">Oncelik Sirasi</p>
              <h2>Bugun Ne Yapacaksin?</h2>
              <div className="sg-focus-actions">
                <button type="button" className="sg-link-btn" onClick={() => navigate(PATHS.SUPPLEMENT_TRACKING)}>
                  1) Takviyeleri Isaretle
                </button>
                <button type="button" className="sg-link-btn" onClick={() => navigate(PATHS.WEEKLY_PROGRAM)}>
                  2) Haftalik Plani Guncelle
                </button>
                <button type="button" className="sg-link-btn" onClick={() => navigate(PATHS.PRODUCTS)}>
                  3) Stok Uygunlugunu Kontrol Et
                </button>
              </div>
            </article>

            <article className="sg-progress-card">
              <p className="sg-progress-kicker">Sistem Durumu</p>
              <h2>Takip Ozeti</h2>

              <div className="sg-progress-row">
                <div className="sg-progress-label">
                  <span>Takviye Uyum Skoru</span>
                  <strong>84%</strong>
                </div>
                <div className="sg-progress-track">
                  <div className="sg-progress-fill is-green" style={{ width: '84%' }} />
                </div>
              </div>

              <div className="sg-progress-row">
                <div className="sg-progress-label">
                  <span>Stok Guvenligi</span>
                  <strong>72%</strong>
                </div>
                <div className="sg-progress-track">
                  <div className="sg-progress-fill is-orange" style={{ width: '72%' }} />
                </div>
              </div>

              <div className="sg-progress-row">
                <div className="sg-progress-label">
                  <span>Plan Tutarliligi</span>
                  <strong>67%</strong>
                </div>
                <div className="sg-progress-track">
                  <div className="sg-progress-fill is-red" style={{ width: '67%' }} />
                </div>
              </div>
            </article>

            <article className="sg-progress-card sg-profile-compact">
              <p className="sg-progress-kicker">Kisisel Bilgiler</p>
              <h2>Profil Ozeti</h2>

              <div className="sg-progress-row">
                <div className="sg-progress-label">
                  <span>Yas</span>
                  <strong>{session?.user.age ?? '-'}</strong>
                </div>
                <div className="sg-progress-label">
                  <span>Cinsiyet</span>
                  <strong>{session?.user.gender || '-'}</strong>
                </div>
              </div>

              <div className="sg-progress-row">
                <div className="sg-progress-label">
                  <span>Boy</span>
                  <strong>{session?.user.heightCm ? `${session.user.heightCm} cm` : '-'}</strong>
                </div>
                <div className="sg-progress-label">
                  <span>Kilo</span>
                  <strong>{session?.user.weightKg ? `${session.user.weightKg} kg` : '-'}</strong>
                </div>
              </div>

              <button
                type="button"
                className="sg-link-btn"
                onClick={() => navigate(PATHS.PROFILE)}
              >
                Profili Duzenle
              </button>
            </article>
          </div>

          <div className="sg-quick-grid">
            {quickCards.map((card) => (
              <article key={card.title} className="sg-quick-card">
                <span className="sg-quick-icon">{card.icon}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <button
                  type="button"
                  className="sg-link-btn"
                  onClick={() => navigate(card.route)}
                >
                  Ac
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="sg-insights">
          <h2>Takip Prensipleri</h2>
          <div className="sg-insight-grid">
            {principles.map((item) => (
              <article key={item.title} className="sg-insight-card">
                <p>{item.detail}</p>
                <strong>{item.title}</strong>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}
