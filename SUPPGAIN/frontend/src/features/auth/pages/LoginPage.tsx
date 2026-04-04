import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage, loginRequest } from '../auth-api'
import { useAuth } from '../auth-context'
import { AuthLayout } from '../components/AuthLayout'
import { PATHS } from '../../../shared/router/paths'

interface LoginLocationState {
  registered?: boolean
  email?: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = (location.state ?? {}) as LoginLocationState
  const { setSession } = useAuth()
  const [email, setEmail] = useState(locationState.email ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const session = await loginRequest({ email, password })
      setSession(session)
      navigate(PATHS.DASHBOARD, { replace: true })
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Hoş Geldin"
      subtitle="Hedefine ulaşmak için hesabına giriş yap."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label" htmlFor="email">
          E-posta
        </label>
        <input
          id="email"
          className="auth-input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label className="auth-label" htmlFor="password">
          Şifre
        </label>
        <input
          id="password"
          className="auth-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <div className="auth-links-row">
          <Link to={PATHS.FORGOT_PASSWORD}>Şifremi unuttum</Link>
        </div>

        {locationState.registered ? (
          <p className="auth-success">Hesap oluşturuldu. Şimdi giriş yapabilirsin.</p>
        ) : null}
        {error ? <p className="auth-error">{error}</p> : null}

        <button className="auth-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <p className="auth-footer-text">
        Hesabın yok mu? <Link to={PATHS.REGISTER}>Yeni Hesap Oluştur</Link>
      </p>
    </AuthLayout>
  )
}
