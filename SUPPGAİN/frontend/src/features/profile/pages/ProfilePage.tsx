import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/auth-context'
import {
  deleteMyProfile,
  getApiErrorMessage,
  getMyProfile,
  updateMyProfile,
} from '../profile-api'
import type { UpdateProfileRequest, UserProfile } from '../types'
import '../../dashboard/dashboard.css'
import { PATHS } from '../../../shared/router/paths'

interface ProfileFormState {
  firstName: string
  lastName: string
  email: string
  phone: string
  age: string
  gender: string
  heightCm: string
  weightKg: string
}

const initialForm: ProfileFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  age: '',
  gender: '',
  heightCm: '',
  weightKg: '',
}

function mapProfileToForm(profile: UserProfile): ProfileFormState {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone ?? '',
    age: profile.age?.toString() ?? '',
    gender: profile.gender ?? '',
    heightCm: profile.heightCm?.toString() ?? '',
    weightKg: profile.weightKg?.toString() ?? '',
  }
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { session, setSession, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [form, setForm] = useState<ProfileFormState>(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile(): Promise<void> {
      if (!session?.token) {
        return
      }

      setIsLoading(true)
      setError('')
      try {
        const response = await getMyProfile(session.token)
        setProfile(response)
        setForm(mapProfileToForm(response))
      } catch (requestError) {
        setError(getApiErrorMessage(requestError))
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfile()
  }, [session?.token])

  const completionRate = useMemo(() => {
    const fields = [
      form.firstName,
      form.lastName,
      form.email,
      form.phone,
      form.age,
      form.gender,
      form.heightCm,
      form.weightKg,
    ]
    const filled = fields.filter((item) => item.trim().length > 0).length
    return Math.round((filled / fields.length) * 100)
  }, [form])

  function handleChange(field: keyof ProfileFormState, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (!session?.token) {
      return
    }

    const payload: UpdateProfileRequest = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      age: form.age ? Number(form.age) : null,
      gender: form.gender.trim() || null,
      heightCm: form.heightCm ? Number(form.heightCm) : null,
      weightKg: form.weightKg ? Number(form.weightKg) : null,
    }

    setIsSaving(true)
    setError('')
    setMessage('')
    try {
      const updated = await updateMyProfile(session.token, payload)
      setProfile(updated)
      setForm(mapProfileToForm(updated))
      setSession({
        ...session,
        user: {
          ...session.user,
          ...updated,
        },
      })
      setMessage('Profil bilgilerin başarıyla kaydedildi.')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteAccount(): Promise<void> {
    if (!session?.token) {
      return
    }

    const shouldDelete = window.confirm(
      'Hesabını silmek istediğine emin misin? Bu işlem geri alınamaz.',
    )
    if (!shouldDelete) {
      return
    }

    try {
      await deleteMyProfile(session.token)
      signOut()
      navigate(PATHS.LOGIN, { replace: true })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    }
  }

  return (
    <main className="sg-dashboard">
      <aside className="sg-sidebar">
        <div>
          <p className="sg-logo">SuppGain</p>
          <p className="sg-logo-sub">Elit Performans</p>
        </div>

        <nav className="sg-nav">
          <button type="button" className="sg-nav-item" onClick={() => navigate(PATHS.DASHBOARD)}>
            Panel
          </button>
          <button type="button" className="sg-nav-item is-active">
            Profil
          </button>
        </nav>

        <button type="button" className="sg-upgrade-btn">
          Pro'ya Yükselt
        </button>
      </aside>

      <section className="sg-main">
        <header className="sg-topbar">
          <p className="sg-welcome">
            Profil Sayfası <span>{profile?.firstName ?? session?.user.firstName ?? 'Sporcu'}</span>
          </p>
          <div className="sg-topbar-actions">
            <button type="button" className="sg-ghost-btn" onClick={() => navigate(PATHS.DASHBOARD)}>
              Ana Sayfaya Dön
            </button>
          </div>
        </header>

        <section className="sg-grid">
          <article className="sg-progress-card">
            <p className="sg-progress-kicker">Profil Tamamlanma</p>
            <h2>{completionRate}%</h2>
            <div className="sg-progress-track">
              <div className="sg-progress-fill is-green" style={{ width: `${completionRate}%` }} />
            </div>
            <p style={{ color: '#8fb0d7', marginTop: '14px' }}>
              Kişisel bilgilerini güncelledikçe bu oran artar. Her girişte kayıtlı
              verilerin buradan yüklenir.
            </p>
            <button
              type="button"
              className="sg-link-btn"
              onClick={handleDeleteAccount}
              style={{ borderColor: '#ff8f8f', color: '#ff8f8f' }}
            >
              Hesabı Sil
            </button>
          </article>

          <article className="sg-progress-card">
            <p className="sg-progress-kicker">Kişisel Özet</p>
            <h2>{profile?.firstName ? `${profile.firstName} ${profile.lastName}` : 'Profilin'}</h2>
            <div className="sg-progress-row">
              <div className="sg-progress-label">
                <span>Yaş</span>
                <strong>{profile?.age ?? '-'}</strong>
              </div>
              <div className="sg-progress-label">
                <span>Cinsiyet</span>
                <strong>{profile?.gender || '-'}</strong>
              </div>
            </div>
            <div className="sg-progress-row">
              <div className="sg-progress-label">
                <span>Boy</span>
                <strong>{profile?.heightCm ? `${profile.heightCm} cm` : '-'}</strong>
              </div>
              <div className="sg-progress-label">
                <span>Kilo</span>
                <strong>{profile?.weightKg ? `${profile.weightKg} kg` : '-'}</strong>
              </div>
            </div>
          </article>
        </section>

        <article className="sg-progress-card">
          <p className="sg-progress-kicker">Bilgilerini Güncelle</p>
          {isLoading ? (
            <p style={{ color: '#8fb0d7' }}>Profil yükleniyor...</p>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="sg-quick-grid">
                <div>
                  <label className="auth-label" htmlFor="firstName">Ad</label>
                  <input
                    id="firstName"
                    className="auth-input"
                    value={form.firstName}
                    onChange={(event) => handleChange('firstName', event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="auth-label" htmlFor="lastName">Soyad</label>
                  <input
                    id="lastName"
                    className="auth-input"
                    value={form.lastName}
                    onChange={(event) => handleChange('lastName', event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="auth-label" htmlFor="email">E-posta</label>
                  <input
                    id="email"
                    className="auth-input"
                    type="email"
                    value={form.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="auth-label" htmlFor="phone">Telefon</label>
                  <input
                    id="phone"
                    className="auth-input"
                    value={form.phone}
                    onChange={(event) => handleChange('phone', event.target.value)}
                  />
                </div>
                <div>
                  <label className="auth-label" htmlFor="age">Yaş</label>
                  <input
                    id="age"
                    className="auth-input"
                    type="number"
                    min={10}
                    max={120}
                    value={form.age}
                    onChange={(event) => handleChange('age', event.target.value)}
                  />
                </div>
                <div>
                  <label className="auth-label" htmlFor="gender">Cinsiyet</label>
                  <select
                    id="gender"
                    className="auth-input"
                    value={form.gender}
                    onChange={(event) => handleChange('gender', event.target.value)}
                  >
                    <option value="">Seçiniz</option>
                    <option value="Erkek">Erkek</option>
                    <option value="Kadın">Kadın</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>
                <div>
                  <label className="auth-label" htmlFor="heightCm">Boy (cm)</label>
                  <input
                    id="heightCm"
                    className="auth-input"
                    type="number"
                    min={50}
                    max={280}
                    step="0.1"
                    value={form.heightCm}
                    onChange={(event) => handleChange('heightCm', event.target.value)}
                  />
                </div>
                <div>
                  <label className="auth-label" htmlFor="weightKg">Kilo (kg)</label>
                  <input
                    id="weightKg"
                    className="auth-input"
                    type="number"
                    min={25}
                    max={400}
                    step="0.1"
                    value={form.weightKg}
                    onChange={(event) => handleChange('weightKg', event.target.value)}
                  />
                </div>
              </div>

              {message ? <p className="auth-success">{message}</p> : null}
              {error ? <p className="auth-error">{error}</p> : null}

              <button className="auth-button" type="submit" disabled={isSaving}>
                {isSaving ? 'Kaydediliyor...' : 'Profili Kaydet'}
              </button>
            </form>
          )}
        </article>
      </section>
    </main>
  )
}
