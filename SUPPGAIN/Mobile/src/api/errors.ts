import { AxiosError } from 'axios';

interface ApiErrorPayload {
  errorCode?: string;
  ErrorCode?: string;
  message?: string;
  Message?: string;
  errors?: Record<string, string[]>;
  Errors?: Record<string, string[]>;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return 'Backend bağlantısı sağlanamadı. API çalışıyor mu kontrol et.';
    }

    const payload = error.response.data as ApiErrorPayload | undefined;
    const errorCode = payload?.errorCode ?? payload?.ErrorCode;
    const rawMessage = payload?.message ?? payload?.Message;
    const validationErrors = payload?.errors ?? payload?.Errors;

    const mappedByCode: Record<string, string> = {
      VALIDATION_ERROR: 'Lütfen girdiğin bilgileri kontrol et.',
      EMAIL_ALREADY_EXISTS: 'Bu e-posta adresi zaten kayıtlı.',
      UNAUTHORIZED: 'E-posta veya şifre hatalı.',
      INVALID_CREDENTIALS: 'E-posta veya şifre hatalı.',
      INVALID_TOKEN: 'Bağlantı geçersiz veya süresi dolmuş.',
      FORBIDDEN: 'Bu işlem için yetkin bulunmuyor.',
      UNHANDLED_EXCEPTION: 'Beklenmeyen bir hata oluştu. Lütfen tekrar dene.',
    };

    if (errorCode && mappedByCode[errorCode]) {
      return mappedByCode[errorCode];
    }

    if (validationErrors) {
      const firstValidationMessage = Object.values(validationErrors)
        .flat()
        .find(Boolean);

      if (firstValidationMessage) {
        return toTurkishValidationMessage(firstValidationMessage);
      }
    }

    if (rawMessage) {
      return toTurkishValidationMessage(rawMessage);
    }
  }

  return 'Bir hata oluştu. Lütfen tekrar dene.';
}

function toTurkishValidationMessage(message: string): string {
  const normalized = message.trim();
  const lower = normalized.toLowerCase();

  if (lower.includes('required')) {
    return 'Zorunlu alanları doldurmalısın.';
  }
  if (lower.includes('email')) {
    return 'Geçerli bir e-posta adresi girmelisin.';
  }
  if (lower.includes('minimum length') || lower.includes('at least')) {
    return 'Girdiğin değer minimum karakter şartını sağlamıyor.';
  }
  if (lower.includes('maximum length')) {
    return 'Girdiğin değer izin verilen karakter sınırını aşıyor.';
  }
  if (lower.includes('already exists')) {
    return 'Bu kayıt zaten mevcut.';
  }

  return normalized;
}

