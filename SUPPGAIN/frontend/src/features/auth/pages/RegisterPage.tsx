import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage, registerRequest } from '../auth-api'
import { AuthLayout } from '../components/AuthLayout'
import { PATHS } from '../../../shared/router/paths'

export function RegisterPage() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await registerRequest({
        firstName,
        lastName,
        email,
        password,
      })
      navigate(PATHS.LOGIN, {
        replace: true,
        state: {
          registered: true,
          email,
        },
      })
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Kayıt Ol"
      subtitle="Programını oluşturmak için yeni hesap aç."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label" htmlFor="firstName">
          Ad
        </label>
        <input
          id="firstName"
          className="auth-input"
          type="text"
          autoComplete="given-name"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          required
        />

        <label className="auth-label" htmlFor="lastName">
          Soyad
        </label>
        <input
          id="lastName"
          className="auth-input"
          type="text"
          autoComplete="family-name"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          required
        />

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
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error ? <p className="auth-error">{error}</p> : null}

        <button className="auth-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
        </button>
      </form>

      <p className="auth-footer-text">
        Zaten hesabın var mı? <Link to={PATHS.LOGIN}>Giriş Yap</Link>
      </p>
    </AuthLayout>
  )
}
