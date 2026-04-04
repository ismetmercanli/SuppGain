import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { forgotPasswordRequest, getApiErrorMessage } from '../auth-api'
import { AuthLayout } from '../components/AuthLayout'
import { PATHS } from '../../../shared/router/paths'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await forgotPasswordRequest({ email })
      setIsSubmitted(true)
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Şifremi Unuttum"
      subtitle="Şifre sıfırlama bağlantısı için e-postanı gir."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label" htmlFor="forgot-email">
          E-posta
        </label>
        <input
          id="forgot-email"
          className="auth-input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={isSubmitted}
        />

        {error ? <p className="auth-error">{error}</p> : null}

        {isSubmitted ? (
          <p className="auth-success">
            Eğer e-posta kayıtlıysa şifre yenileme bağlantısı gönderildi. Gelen kutunu ve spam klasörünü kontrol et.
          </p>
        ) : null}

        <button className="auth-button" type="submit" disabled={isSubmitting || isSubmitted}>
          {isSubmitting ? 'Gönderiliyor…' : 'Bağlantı Gönder'}
        </button>
      </form>

      <p className="auth-footer-text">
        Giriş sayfasına dönmek için <Link to={PATHS.LOGIN}>tıkla</Link>.
      </p>
    </AuthLayout>
  )
}
