import { useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getApiErrorMessage, resetPasswordRequest } from '../auth-api'
import { AuthLayout } from '../components/AuthLayout'
import { PATHS } from '../../../shared/router/paths'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const emailFromQuery = useMemo(() => searchParams.get('email') ?? '', [searchParams])
  const tokenFromQuery = useMemo(() => searchParams.get('token') ?? '', [searchParams])

  const [email, setEmail] = useState(emailFromQuery)
  const [token, setToken] = useState(tokenFromQuery)
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const missingLink = !emailFromQuery.trim() || !tokenFromQuery.trim()

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await resetPasswordRequest({
        email: email.trim(),
        token: token.trim(),
        newPassword,
      })
      setDone(true)
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (missingLink && !done) {
    return (
      <AuthLayout title="Şifre Sıfırlama" subtitle="Geçerli bir bağlantı bulunamadı.">
        <p className="auth-footer-text">
          <Link to={PATHS.FORGOT_PASSWORD}>Şifremi unuttum</Link> sayfasından yeni bağlantı iste.
        </p>
        <p className="auth-footer-text">
          <Link to={PATHS.LOGIN}>Girişe dön</Link>
        </p>
      </AuthLayout>
    )
  }

  if (done) {
    return (
      <AuthLayout title="Şifre Güncellendi" subtitle="Yeni şifrenle giriş yapabilirsin.">
        <p className="auth-success">Şifren başarıyla güncellendi.</p>
        <Link className="auth-button" to={PATHS.LOGIN} style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>
          Giriş Yap
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Yeni Şifre"
      subtitle="En az 8 karakter kullan."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label" htmlFor="reset-email">
          E-posta
        </label>
        <input
          id="reset-email"
          className="auth-input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label className="auth-label" htmlFor="reset-token">
          Sıfırlama kodu (bağlantıdan gelir)
        </label>
        <input
          id="reset-token"
          className="auth-input"
          type="text"
          autoComplete="off"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          required
          spellCheck={false}
        />

        <label className="auth-label" htmlFor="reset-password">
          Yeni şifre
        </label>
        <input
          id="reset-password"
          className="auth-input"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
          minLength={8}
        />

        {error ? <p className="auth-error">{error}</p> : null}

        <button className="auth-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Kaydediliyor…' : 'Şifreyi Güncelle'}
        </button>
      </form>

      <p className="auth-footer-text">
        <Link to={PATHS.LOGIN}>Girişe dön</Link>
      </p>
    </AuthLayout>
  )
}
